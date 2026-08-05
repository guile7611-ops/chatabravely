import { frontendURL } from '../../../helper/URLHelper';
import {
  ROLES,
  CONVERSATION_PERMISSIONS,
} from 'dashboard/constants/permissions.js';

import account from './account/account.routes';
import agent from './agents/agent.routes';
import canned from './canned/canned.routes';
import inbox from './inbox/inbox.routes';
import labels from './labels/labels.routes';
import reports from './reports/reports.routes';
import store from '../../../store';
import teams from './teams/teams.routes';
import profile from './profile/profile.routes';

export default {
  routes: [
    {
      path: frontendURL('accounts/:accountId/settings'),
      name: 'settings_home',
      meta: {
        permissions: [...ROLES, ...CONVERSATION_PERMISSIONS],
      },
      redirect: to => {
        if (
          store.getters.getCurrentRole === 'administrator' &&
          store.getters.getCurrentCustomRoleId === null
        ) {
          return { name: 'general_settings_index', params: to.params };
        }

        return { name: 'canned_list', params: to.params };
      },
    },
    ...account.routes,
    ...agent.routes,
    ...canned.routes,
    ...inbox.routes,
    ...labels.routes,
    ...reports.routes,
    ...teams.routes,
    ...profile.routes,
  ],
};
