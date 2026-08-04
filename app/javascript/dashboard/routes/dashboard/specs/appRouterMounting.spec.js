import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createI18n } from 'vue-i18n';
import App from 'dashboard/App.vue';
import router, { validateAuthenticateRoutePermission } from 'dashboard/routes';
import { clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  missing: (_locale, key) => key,
  messages: { pt_BR: {} },
});

describe('App.vue + Real Vue Router Integration Test', () => {
  let store;

  beforeEach(async () => {
    clearAbravelyJwtToken();
    localStorage.clear();
    sessionStorage.clear();

    store = createStore({
      getters: {
        isLoggedIn: () => false,
        getCurrentUser: () => ({ id: null, role: 'administrator' }),
        getCurrentAccountId: () => null,
        getCurrentRole: () => 'administrator',
        getAuthUIFlags: () => ({ isFetching: false }),
        getAccount: () => () => ({ id: 1, name: 'Abravely Chat' }),
        isRTL: () => false,
        'accounts/isRTL': () => false,
        'globalConfig/get': () => ({
          installationName: 'Abravely Chat',
          logo: '/brand-assets/logo.svg',
          logoDark: '/brand-assets/logo_dark.svg',
        }),
      },
      actions: {
        setUser: () => Promise.resolve(),
      },
    });

    await router.push('/app/login');
    await router.isReady();
  });

  it('redirects unauthenticated access from /app/accounts/1/dashboard to /app/login', async () => {
    const targetRoute = { path: '/app/accounts/1/dashboard', params: { accountId: '1' } };
    const redirectUrl = await validateAuthenticateRoutePermission(targetRoute);
    expect(redirectUrl).toBe('/app/login');
  });

  it('mounts App.vue with real router on /app/login and renders login inputs without mocking LoginView', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [store, router, i18n],
        stubs: {
          WootSnackbarBox: true,
          LoadingState: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await router.isReady();

    expect(wrapper.find('input[data-testid="email_input"]').exists()).toBe(true);
    expect(wrapper.find('input[data-testid="password_input"]').exists()).toBe(true);
    expect(wrapper.find('button[data-testid="submit_button"]').exists()).toBe(true);
  });
});
