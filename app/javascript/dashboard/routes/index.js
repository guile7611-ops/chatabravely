import { createRouter, createWebHistory } from 'vue-router';

import dashboard from './dashboard/dashboard.routes';
import store from 'dashboard/store';
import AnalyticsHelper from '../helper/AnalyticsHelper';

const routes = [...dashboard.routes];

export const router = createRouter({ history: createWebHistory(), routes });

export const validateAuthenticateRoutePermission = async (to) => {
  if (to.path.includes('/app/accounts/')) {
    return true;
  }

  if (
    to.path === '/' ||
    to.path === '/app' ||
    to.path === '/app/' ||
    to.path === '/app/login' ||
    to.path === '/login'
  ) {
    return '/app/accounts/1/dashboard';
  }

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
