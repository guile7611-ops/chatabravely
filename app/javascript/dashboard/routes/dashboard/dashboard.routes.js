import settings from './settings/settings.routes';
import conversation from './conversation/conversation.routes';
import { routes as searchRoutes } from '../../modules/search/search.routes';
import { routes as contactRoutes } from './contacts/routes';
import { frontendURL } from '../../helper/URLHelper';
import helpcenterRoutes from './helpcenter/helpcenter.routes';
import AppContainer from './Dashboard.vue';
import Suspended from './suspended/Index.vue';
import NoAccounts from './noAccounts/Index.vue';

import LoginView from 'v3/views/login/Index.vue';

export default {
  routes: [
    {
      path: '/',
      redirect: '/app/accounts/1/dashboard',
    },
    {
      path: '/app',
      redirect: '/app/accounts/1/dashboard',
    },
    {
      path: '/app/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/login',
      name: 'auth_login',
      component: LoginView,
    },
    {
      path: frontendURL('accounts/:accountId'),
      component: AppContainer,
      children: [
        ...conversation.routes,
        ...settings.routes,
        ...contactRoutes,
        ...searchRoutes,
        ...helpcenterRoutes.routes,
      ],
    },
    {
      path: frontendURL('accounts/:accountId/suspended'),
      name: 'account_suspended',
      meta: {
        permissions: ['administrator', 'agent', 'custom_role'],
      },
      component: Suspended,
    },
    {
      path: frontendURL('no-accounts'),
      name: 'no_accounts',
      component: NoAccounts,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/app/accounts/1/dashboard',
    },
  ],
};
