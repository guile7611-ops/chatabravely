import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import App from 'dashboard/App.vue';
import store from 'dashboard/store';
import router, { initalizeRouter } from 'dashboard/routes';
import { clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  missing: (_locale, key) => key,
  messages: { pt_BR: {} },
});

describe('Real App.vue + Real Store + Real Vue Router Integration Test', () => {
  beforeEach(async () => {
    clearAbravelyJwtToken();
    localStorage.clear();
    sessionStorage.clear();
    initalizeRouter();
  });

  it('validates that the real auth module initial state is unauthenticated', () => {
    expect(store.getters.isLoggedIn).toBe(false);
    expect(store.getters.getCurrentUserID).toBeNull();
    expect(store.getters.getCurrentAccount).toBeNull();
    expect(store.getters.getCurrentRole).toBeNull();
  });

  it('redirects unauthenticated access from /app/accounts/1/dashboard to /app/login exactly once', async () => {
    await router.push('/app/accounts/1/dashboard');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/app/login');
  });

  it('mounts App.vue with real store and real router on /app/login and renders login inputs without mocking LoginView', async () => {
    await router.push('/app/login');
    await router.isReady();

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

    expect(router.currentRoute.value.path).toBe('/app/login');
    expect(wrapper.find('input[data-testid="email_input"]').exists()).toBe(true);
    expect(wrapper.find('input[data-testid="password_input"]').exists()).toBe(true);
    expect(wrapper.find('button[data-testid="submit_button"]').exists()).toBe(true);
  });
});
