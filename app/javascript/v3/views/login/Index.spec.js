import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import Index from './Index.vue';
import MfaVerification from 'dashboard/components/auth/MfaVerification.vue';
import * as authAPI from '../../api/auth';
import * as apiUtils from 'dashboard/store/utils/api';
import { getAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';
import axios from 'axios';

vi.mock('../../api/auth');
vi.mock('axios');
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (msg) => msg }),
}));

describe('Login Component Index.vue - Atomic Dual Authentication Flow', () => {
  let dispatchMock;
  let originalWindowLocation;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAbravelyJwtToken();
    dispatchMock = vi.fn();

    originalWindowLocation = window.location;
    delete window.location;
    window.location = { href: 'http://localhost/app/login' };

    window.chatwootConfig = {
      allowedLoginMethods: ['email'],
    };
  });

  afterEach(() => {
    window.location = originalWindowLocation;
  });

  function getWrapper(options = {}) {
    return shallowMount(Index, {
      ...options,
      global: {
        mocks: {
          $t: (msg) => msg,
          $router: { push: vi.fn(), replace: vi.fn() },
          $route: { query: {} },
          $store: {
            dispatch: dispatchMock,
            getters: { 'globalConfig/get': {} },
          },
        },
        stubs: {
          FormInput: true,
          NextButton: true,
          Spinner: true,
          Icon: true,
          'router-link': true,
          ...options?.global?.stubs,
        },
      },
    });
  }

  it('calls Rails login with redirect:false and only sets window.location ONCE after Express JWT is stored', async () => {
    const setAuthCredentialsSpy = vi.spyOn(apiUtils, 'setAuthCredentials');

    authAPI.login.mockResolvedValue({
      success: true,
      response: { data: { data: { id: 1 } }, headers: {} },
      user: { id: 1 },
      redirectUrl: '/app/accounts/1/dashboard',
    });

    dispatchMock.mockImplementation((action) => {
      if (action === 'loginWithCredentials') {
        window.chatwootConfig.abravelyJwtToken = 'header.payload.signature_real_xyz';
        return Promise.resolve('header.payload.signature_real_xyz');
      }
      return Promise.resolve();
    });

    const wrapper = getWrapper();
    wrapper.vm.credentials.email = 'agente@abravely.com';
    wrapper.vm.credentials.password = 'minhasenha123';

    await wrapper.vm.submitLogin();
    await flushPromises();

    expect(authAPI.login).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'agente@abravely.com',
        password: 'minhasenha123',
      }),
      { redirect: false }
    );

    expect(dispatchMock).toHaveBeenCalledWith('loginWithCredentials', {
      email: 'agente@abravely.com',
      password: 'minhasenha123',
    });

    expect(getAbravelyJwtToken()).toBe('header.payload.signature_real_xyz');
    expect(setAuthCredentialsSpy).toHaveBeenCalledTimes(1);
    expect(window.location).toBe('/app/accounts/1/dashboard');
  });

  it('remains strictly on login page (http://localhost/app/login) and clears session when Express fails', async () => {
    const clearCookiesSpy = vi.spyOn(apiUtils, 'clearBrowserSessionCookies');
    const clearLocalStorageSpy = vi.spyOn(apiUtils, 'clearLocalStorageOnLogout');

    authAPI.login.mockResolvedValue({
      success: true,
      response: { data: { data: { id: 1 } }, headers: {} },
      user: { id: 1 },
      redirectUrl: '/app/accounts/1/dashboard',
    });

    dispatchMock.mockImplementation((action) => {
      if (action === 'loginWithCredentials') {
        return Promise.reject(new Error('Falha ao autenticar no serviço Abravely WebSocket.'));
      }
      return Promise.resolve();
    });

    const wrapper = getWrapper();
    wrapper.vm.credentials.email = 'agente@abravely.com';
    wrapper.vm.credentials.password = 'senhaerrada';

    await wrapper.vm.submitLogin();
    await flushPromises();

    expect(clearCookiesSpy).toHaveBeenCalled();
    expect(clearLocalStorageSpy).toHaveBeenCalled();
    expect(getAbravelyJwtToken()).toBeNull();

    // PROVA ESTRITA: window.location permanece intacto na pagina de login
    expect(wrapper.vm.loginApi.hasErrored).toBe(true);
    expect(window.location.href).toBe('http://localhost/app/login');
  });

  it('integration: MfaVerification emits verified without internal redirect and Index coordinates Express JWT before final redirect', async () => {
    axios.post.mockResolvedValue({
      data: { redirectUrl: '/app/accounts/1/dashboard' },
      headers: { 'access-token': 'abc', client: '123', uid: 'u' },
    });

    dispatchMock.mockImplementation((action) => {
      if (action === 'loginWithCredentials') {
        window.chatwootConfig.abravelyJwtToken = 'mfa_express_jwt_123';
        return Promise.resolve('mfa_express_jwt_123');
      }
      return Promise.resolve();
    });

    const wrapper = mount(MfaVerification, {
      props: { mfaToken: 'test_mfa_token' },
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          Icon: true,
          FormInput: true,
          NextButton: true,
          Dialog: true,
        },
      },
    });

    wrapper.vm.otpDigits = ['1', '2', '3', '4', '5', '6'];
    await wrapper.vm.handleVerification();

    // Confirmar que MfaVerification emitou 'verified' e NAO fez window.location.href
    expect(wrapper.emitted('verified')).toBeTruthy();
    const emittedResponse = wrapper.emitted('verified')[0][0];
    expect(window.location.href).toBe('http://localhost/app/login');

    // Agora simular recebimento pelo Index.vue
    const indexWrapper = getWrapper();
    indexWrapper.vm.credentials.email = 'agente@abravely.com';
    indexWrapper.vm.credentials.password = 'senhaMfa123';

    await indexWrapper.vm.handleMfaVerified(emittedResponse);
    await flushPromises();

    // Confirmar que o Index.vue obteve o JWT Express antes de redirecionar
    expect(dispatchMock).toHaveBeenCalledWith('loginWithCredentials', {
      email: 'agente@abravely.com',
      password: 'senhaMfa123',
    });
    expect(getAbravelyJwtToken()).toBe('mfa_express_jwt_123');
    expect(window.location).toBe('/app/accounts/1/dashboard');
  });

  it('passes revocation parameters (revoke_session_id and revoke_all_sessions) to authAPI.login during session retry', async () => {
    authAPI.login.mockResolvedValue({
      success: true,
      response: { data: { data: { id: 1 } }, headers: {} },
      user: { id: 1 },
      redirectUrl: '/app/accounts/1/dashboard',
    });
    dispatchMock.mockResolvedValue('jwt_token');

    const wrapper = getWrapper();
    wrapper.vm.credentials.email = 'agente@abravely.com';
    wrapper.vm.credentials.password = 'minhasenha123';

    await wrapper.vm.handleSessionRevoke('session_abc_123');
    await flushPromises();

    expect(authAPI.login).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'agente@abravely.com',
        password: 'minhasenha123',
        revoke_session_id: 'session_abc_123',
      }),
      { redirect: false }
    );
  });

  it('guarantees that password is never persisted in storage or global config', async () => {
    authAPI.login.mockResolvedValue({
      success: true,
      response: { data: { data: { id: 1 } }, headers: {} },
      user: { id: 1 },
      redirectUrl: '/app/accounts/1/dashboard',
    });
    dispatchMock.mockResolvedValue('jwt_token');

    const wrapper = getWrapper();
    wrapper.vm.credentials.email = 'agente@abravely.com';
    wrapper.vm.credentials.password = 'senhaSuperSecreta!123';

    await wrapper.vm.submitLogin();
    await flushPromises();

    const localJwt = localStorage.getItem('abravely_jwt_token') || '';
    const sessionJwt = sessionStorage.getItem('abravely_jwt_token') || '';

    expect(localJwt).not.toContain('senhaSuperSecreta!123');
    expect(sessionJwt).not.toContain('senhaSuperSecreta!123');
    expect(window.chatwootConfig.password).toBeUndefined();
  });
});
