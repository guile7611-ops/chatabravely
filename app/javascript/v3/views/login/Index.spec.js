import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import Index from './Index.vue';
import * as authAPI from '../../api/auth';
import { getAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

vi.mock('../../api/auth');

describe('Login Component Index.vue - Dual Authentication Flow', () => {
  let dispatchMock;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAbravelyJwtToken();
    dispatchMock = vi.fn();

    window.chatwootConfig = {
      allowedLoginMethods: ['email'],
    };
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

  it('triggers Express loginWithCredentials on Rails login success and stores JWT', async () => {
    authAPI.login.mockResolvedValue({ success: true });
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

    expect(authAPI.login).toHaveBeenCalledWith({
      email: 'agente@abravely.com',
      password: 'minhasenha123',
      sso_auth_token: '',
      ssoAccountId: '',
      ssoConversationId: '',
    });

    expect(dispatchMock).toHaveBeenCalledWith('loginWithCredentials', {
      email: 'agente@abravely.com',
      password: 'minhasenha123',
    });

    expect(getAbravelyJwtToken()).toBe('header.payload.signature_real_xyz');
  });

  it('handles Express login failure with explicit error and without inventing tokens', async () => {
    authAPI.login.mockResolvedValue({ success: true });
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

    expect(dispatchMock).toHaveBeenCalledWith('loginWithCredentials', {
      email: 'agente@abravely.com',
      password: 'senhaerrada',
    });

    expect(wrapper.vm.loginApi.hasErrored).toBe(true);
    expect(wrapper.vm.loginApi.showLoading).toBe(false);
    expect(getAbravelyJwtToken()).toBeNull();
  });

  it('guarantees that password is never persisted in storage or global config', async () => {
    authAPI.login.mockResolvedValue({ success: true });
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
