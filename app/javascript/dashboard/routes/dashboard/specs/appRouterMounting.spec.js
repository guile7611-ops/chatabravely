import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bootstrapDashboardApp } from '../../../../entrypoints/dashboard.js';
import { clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

describe('Real Production Bootstrap Integration Test for /app/login', () => {
  let container;
  let currentApp;

  beforeEach(() => {
    clearAbravelyJwtToken();
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';
    container = document.querySelector('#app');
  });

  afterEach(() => {
    if (currentApp) {
      currentApp.unmount();
      currentApp = null;
    }
    document.body.innerHTML = '';
  });

  it('executes full production bootstrapDashboardApp on /app/login without mocks on initial load', async () => {
    window.history.pushState({}, '', '/app/login');

    const { app, router, store } = await bootstrapDashboardApp(container);
    currentApp = app;

    expect(store.getters.isLoggedIn).toBe(false);
    expect(router.currentRoute.value.path).toBe('/app/login');

    const emailInput = container.querySelector('input[data-testid="email_input"]');
    const passwordInput = container.querySelector('input[data-testid="password_input"]');
    const submitButton = container.querySelector('button[data-testid="submit_button"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitButton).not.toBeNull();
  });

  it('redirects unauthenticated access from /app/accounts/1/dashboard to /app/login on initial load', async () => {
    window.history.pushState({}, '', '/app/accounts/1/dashboard');

    const { app, router } = await bootstrapDashboardApp(container);
    currentApp = app;

    expect(router.currentRoute.value.path).toBe('/app/login');
    expect(container.querySelector('input[data-testid="email_input"]')).not.toBeNull();
  });
});
