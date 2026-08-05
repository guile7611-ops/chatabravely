import { frontendURL } from '../../../helper/URLHelper';
import ConversationView from './ConversationView.vue';

const permissions = [
  'administrator',
  'agent',
  'conversation_manage',
  'conversation_unassigned_manage',
];

export default {
  routes: [
    {
      path: frontendURL('accounts/:accountId/dashboard'),
      name: 'home',
      component: ConversationView,
      meta: { permissions },
      props: { inboxId: 0 },
    },
    {
      path: frontendURL('accounts/:accountId/conversations/:conversation_id'),
      name: 'inbox_conversation',
      component: ConversationView,
      meta: { permissions },
      props: route => ({
        inboxId: 0,
        conversationId: route.params.conversation_id,
      }),
    },
  ],
};
