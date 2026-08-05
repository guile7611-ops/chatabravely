import { frontendURL } from '../../../helper/URLHelper';
import ContactsIndex from './pages/ContactsIndex.vue';
import ContactManageView from './pages/ContactManageView.vue';

const commonMeta = {
  permissions: ['administrator', 'agent', 'contact_manage'],
};

export const routes = [
  {
    path: frontendURL('accounts/:accountId/contacts'),
    name: 'contacts_dashboard_index',
    component: ContactsIndex,
    meta: commonMeta,
  },
  {
    path: frontendURL('accounts/:accountId/contacts/:contactId'),
    name: 'contacts_edit',
    component: ContactManageView,
    meta: commonMeta,
  },
];
