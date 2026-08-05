import { frontendURL } from '../../../../helper/URLHelper';
import ChannelFactory from './ChannelFactory.vue';

import SettingsContent from '../Wrapper.vue';
import SettingsWrapper from '../SettingsWrapper.vue';
import InboxHome from './Index.vue';
import InboxChannel from './InboxChannels.vue';
import ChannelList from './ChannelList.vue';

export default {
  routes: [
    {
      path: frontendURL('accounts/:accountId/settings/channels'),
      component: SettingsWrapper,
      children: [
        {
          path: '',
          redirect: to => {
            return { name: 'settings_inbox_list', params: to.params };
          },
        },
        {
          path: 'list',
          name: 'settings_inbox_list',
          component: InboxHome,
          meta: {
            permissions: ['administrator'],
          },
        },
      ],
    },
    {
      path: frontendURL('accounts/:accountId/settings/channels'),
      component: SettingsContent,
      props: params => {
        const showBackButton = params.name !== 'settings_inbox_list';
        const fullWidth = params.name === 'settings_inbox_show';
        return {
          headerTitle: 'INBOX_MGMT.HEADER',
          icon: 'mail-inbox-all',
          showBackButton,
          fullWidth,
        };
      },
      children: [
        {
          path: 'new',
          component: InboxChannel,
          children: [
            {
              path: '',
              name: 'settings_inbox_new',
              component: ChannelList,
              meta: {
                permissions: ['administrator'],
              },
            },
            {
              path: ':sub_page',
              name: 'settings_inboxes_page_channel',
              component: ChannelFactory,
              meta: {
                permissions: ['administrator'],
              },
              props: route => {
                return { channelName: route.params.sub_page };
              },
            },
          ],
        },
      ],
    },
    {
      path: frontendURL('accounts/:accountId/settings/inboxes/:pathMatch(.*)*'),
      redirect: to => ({
        name: 'settings_inbox_list',
        params: { accountId: to.params.accountId },
      }),
    },
  ],
};
