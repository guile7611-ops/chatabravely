import { createRouter, createWebHistory } from 'vue-router';

import dashboard from './dashboard/dashboard.routes';
import store from 'dashboard/store';
import AnalyticsHelper from '../helper/AnalyticsHelper';

const routes = [...dashboard.routes];

export const router = createRouter({ history: createWebHistory(), routes });

import { getAbravelyJwtToken } from '../helper/abravelyToken';
import { validateLoggedInRoutes } from '../helper/routeHelpers';

export const validateAuthenticateRoutePermission = async (to, next) => {
  const targetPath = to?.path || '';
  const hasToken = Boolean(getAbravelyJwtToken()) || Boolean(store?.getters?.isLoggedIn);

  if (targetPath === '/app/login' || targetPath === '/login') {
    if (hasToken) {
      if (typeof next === 'function') return next('/app/accounts/1/dashboard');
      return '/app/accounts/1/dashboard';
    }
    if (typeof next === 'function') return next();
    return true;
  }

  if (targetPath.includes('/app/accounts/') || to?.params?.accountId) {
    if (!hasToken) {
      if (typeof next === 'function') {
        return next('/app/login');
      }
      return '/app/login';
    }

    const user = store?.getters?.getCurrentUser || {};
    const routeAccountId = Number(to?.params?.accountId);
    if (!Number.isInteger(routeAccountId) || routeAccountId <= 0) {
      const actualAccountId = Number(
        user.account_id || user.accounts?.[0]?.id
      );
      if (!Number.isInteger(actualAccountId) || actualAccountId <= 0) {
        if (typeof next === 'function') return next('/app/login');
        return '/app/login';
      }

      const normalizedPath = targetPath.replace(
        /^\/app\/accounts\/[^/]+/,
        `/app/accounts/${actualAccountId}`
      );
      if (typeof next === 'function') return next(normalizedPath);
      return normalizedPath;
    }

    const redirectUrl = validateLoggedInRoutes(to, user);
    if (redirectUrl) {
      const fullRedirect = redirectUrl.startsWith('/app/')
        ? redirectUrl
        : `/app/${redirectUrl.replace(/^\/?(app\/)?/, '')}`;
      if (typeof next === 'function') return next(fullRedirect);
      return fullRedirect;
    }

    if (typeof next === 'function') return next();
    return true;
  }

  if (targetPath === '/' || targetPath === '/app' || targetPath === '/app/') {
    const dest = hasToken ? '/app/accounts/1/dashboard' : '/app/login';
    if (typeof next === 'function') return next(dest);
    return dest;
  }

  if (typeof next === 'function') return next();
  return true;
};

let isRouterInitialized = false;

export const initalizeRouter = () => {
  if (isRouterInitialized) return;
  isRouterInitialized = true;

  const userAuthentication = store.dispatch('setUser');

  router.onError((error, to) => {
    console.error(`[Router Error] Falha de navegação para ${to?.path || 'desconhecido'}:`, error);
  });

  router.beforeEach(async (to) => {
    try {
      AnalyticsHelper.page(to.name || '', {
        path: to.path,
        name: to.name,
      });

      // Do not render an authenticated route with the empty initial auth state.
      // The dashboard is a fresh application after the login redirect, so it
      // must finish restoring the user from the Abravely JWT before children
      // such as the sidebar and ConversationView are mounted.
      await userAuthentication;
      return await validateAuthenticateRoutePermission(to);
    } catch (e) {
      console.warn('[Router Warning] Exceção na guarda de rota:', e);
      return await validateAuthenticateRoutePermission(to);
    }
  });
};

export default router;
