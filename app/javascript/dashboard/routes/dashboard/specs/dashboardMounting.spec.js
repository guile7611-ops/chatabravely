import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import Dashboard from '../Dashboard.vue';
import ConversationView from '../conversation/ConversationView.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  missing: (_locale, key) => key,
  messages: { pt_BR: {} },
});

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'home', params: { accountId: '1' } }),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock de subcomponentes pesados para isolamento limpo da montagem
vi.mock('next/sidebar/Sidebar.vue', () => ({
  default: {
    name: 'NextSidebar',
    template: '<div class="next-sidebar-stub">NextSidebar Mounted Successfully</div>',
  },
}));

vi.mock('dashboard/components/widgets/modal/WootKeyShortcutModal.vue', () => ({
  default: { name: 'WootKeyShortcutModal', template: '<div></div>' },
}));

vi.mock('dashboard/components/app/AddAccountModal.vue', () => ({
  default: { name: 'AddAccountModal', template: '<div></div>' },
}));


vi.mock('../conversation/ConversationView.vue', () => ({
  default: {
    name: 'ConversationView',
    template: '<div class="conversation-view-stub">ConversationView Mounted Successfully</div>',
  },
}));

describe('Dashboard Vue Component Integration Test with Real Administrator Role', () => {
  let mockStore;
  let mockRoute;

  beforeEach(() => {
    mockRoute = {
      params: { accountId: '1' },
      path: '/app/accounts/1/dashboard',
    };

    mockStore = {
      dispatch: vi.fn().mockResolvedValue(),
      getters: {
        getCurrentUser: {
          id: 1,
          name: 'Guilherme Tenorio',
          email: 'guilherme@abravely.com',
          role: 'administrator',
          account_id: 1,
          accounts: [
            {
              id: 1,
              name: 'Abravely Demo Org',
              role: 'administrator',
              status: 'active',
              permissions: ['administrator', 'agent'],
            },
          ],
        },
        getCurrentRole: 'administrator',
        getCurrentUserID: 1,
        getAccount: () => ({
          id: 1,
          name: 'Abravely Demo Org',
          role: 'administrator',
        }),
        'accounts/getAccountUIFlags': { isFetching: false },
        'inboxes/getInboxes': [],
        'teams/getTeams': [],
        'labels/getLabels': [],
        'agents/getAgents': [],
        getAllConversations: [],
        getSelectedChat: {},
        getConversationsError: null,
        getUIFlags: { isFetching: false },
      },
    };
  });

  it('mounts Dashboard.vue, NextSidebar and renders router view correctly for an administrator user', () => {
    const wrapper = mount(Dashboard, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: mockStore,
          $route: mockRoute,
          $t: (key) => key,
        },
        stubs: {
          CommandBar: true,
          WootKeyShortcutModal: true,
          AddAccountModal: true,
          'router-view': ConversationView,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.next-sidebar-stub').exists()).toBe(true);
    expect(wrapper.find('.next-sidebar-stub').text()).toContain('NextSidebar Mounted Successfully');
    expect(wrapper.find('.conversation-view-stub').exists()).toBe(true);
    expect(wrapper.find('.conversation-view-stub').text()).toContain('ConversationView Mounted Successfully');
  });
});
