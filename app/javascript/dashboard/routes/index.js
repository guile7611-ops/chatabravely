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
        if (typeof window !== 'undefined' && window.location && typeof window.location.assign === 'function') {
          window.location.assign('/app/login');
        }
        return next('/app/login');
      }
      return '/app/login';
    }

    const user = store?.getters?.getCurrentUser || {};
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

export const initalizeRouter = () => {
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

      await Promise.race([
        userAuthentication,
        new Promise(resolve => setTimeout(resolve, 300)),
      ]);
      return await validateAuthenticateRoutePermission(to);
    } catch (e) {
      console.warn('[Router Warning] Exceção na guarda de rota:', e);
      return await validateAuthenticateRoutePermission(to);
    }
  });
};

export default router;
