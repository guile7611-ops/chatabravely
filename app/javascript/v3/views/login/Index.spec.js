import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import Index from './Index.vue';
import * as authAPI from '../../api/auth';
import * as apiUtils from 'dashboard/store/utils/api';
import { getAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

vi.mock('../../api/auth');

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

  function getWrapper() {
    return shallowMount(Index, {
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

    // 1. Confirmar que o login Rails foi chamado com redirect: false
    expect(authAPI.login).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'agente@abravely.com',
        password: 'minhasenha123',
      }),
      { redirect: false }
    );

    // 2. Confirmar dispatch para obter JWT Express
    expect(dispatchMock).toHaveBeenCalledWith('loginWithCredentials', {
      email: 'agente@abravely.com',
      password: 'minhasenha123',
    });

    // 3. Confirmar persistencia do JWT
    expect(getAbravelyJwtToken()).toBe('header.payload.signature_real_xyz');

    // 4. Confirmar que o redirecionamento via window.location ocorreu apenas ao final
    expect(setAuthCredentialsSpy).toHaveBeenCalledTimes(1);
    expect(window.location).toBe('/app/accounts/1/dashboard');
  });

  it('invalidates Rails session and clears JWT when Express login fails, preventing redirect', async () => {
    const clearCookiesSpy = vi.spyOn(apiUtils, 'clearCookiesOnLogout');
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

    // 1. Confirmar tentativa de obtencao
    expect(dispatchMock).toHaveBeenCalledWith('loginWithCredentials', {
      email: 'agente@abravely.com',
      password: 'senhaerrada',
    });

    // 2. Confirmar limpeza das sessoes Rails e JWT
    expect(clearCookiesSpy).toHaveBeenCalled();
    expect(clearLocalStorageSpy).toHaveBeenCalled();
    expect(getAbravelyJwtToken()).toBeNull();

    // 3. Confirmar que window.location NAO foi alterado para a URL do dashboard
    expect(wrapper.vm.loginApi.hasErrored).toBe(true);
    expect(window.location).not.toBe('/app/accounts/1/dashboard');
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
