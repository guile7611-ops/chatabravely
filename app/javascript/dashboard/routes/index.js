import { createRouter, createWebHistory } from 'vue-router';

import dashboard from './dashboard/dashboard.routes';
import store from 'dashboard/store';
import AnalyticsHelper from '../helper/AnalyticsHelper';

const routes = [...dashboard.routes];

export const router = createRouter({ history: createWebHistory(), routes });

export const validateAuthenticateRoutePermission = async (to, next) => {
  // If user is accessing a valid account route, proceed directly
  if (to.path.includes('/app/accounts/')) {
    return next();
  }

  // Handle root and login route redirects once to dashboard
  if (
    to.path === '/' ||
    to.path === '/app' ||
    to.path === '/app/' ||
    to.path === '/app/login' ||
    to.path === '/login'
  ) {
    return next('/app/accounts/1/dashboard');
  }

  // Fallback to allow matching route
  return next();
};

export const initalizeRouter = () => {
  const userAuthentication = store.dispatch('setUser');

  router.beforeEach(async (to, _from, next) => {
    try {
      AnalyticsHelper.page(to.name || '', {
        path: to.path,
        name: to.name,
      });

      await userAuthentication;
      await validateAuthenticateRoutePermission(to, next);
    } catch (e) {
      next();
    }
  });
};

export default router;
