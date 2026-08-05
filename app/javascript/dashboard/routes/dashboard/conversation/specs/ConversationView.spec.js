import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ConversationView from '../ConversationView.vue';

vi.mock('dashboard/composables/useUISettings', () => ({
  useUISettings: () => ({
    uiSettings: ref({ conversation_display_type: 'condensed' }),
    updateUISettings: vi.fn(),
  }),
}));

vi.mock('dashboard/composables/useAccount', () => ({
  useAccount: () => ({ accountId: ref(1) }),
}));

const conversation = {
  id: 'conversation-1',
  messages: [],
};

let mountedWrapper;

afterEach(() => {
  mountedWrapper?.unmount();
  mountedWrapper = null;
});

const mountView = ({
  conversationId = 'conversation-1',
  currentChat = {},
} = {}) => {
  const dispatch = vi.fn().mockResolvedValue();
  const routerPush = vi.fn().mockResolvedValue();
  const routerReplace = vi.fn().mockResolvedValue();
  const store = {
    dispatch,
    getters: {
      getConversationsError: null,
      getCurrentUserID: 'user-1',
      'agents/getAgents': [],
      'teams/getTeams': [],
      'abravelyConversationPanel/getSelectedConversation': currentChat,
    },
  };

  const wrapper = mount(ConversationView, {
    props: { conversationId },
    global: {
      mocks: {
        $store: store,
        $route: { params: { accountId: '1' }, query: {} },
        $router: { push: routerPush, replace: routerReplace },
      },
      stubs: {
        AbravelyQueueList: {
          name: 'AbravelyQueueList',
          template: '<div />',
        },
        AbravelyConversationPanel: {
          name: 'AbravelyConversationPanel',
          template: '<div />',
        },
        ConversationEmptyState: true,
        CmdBarConversationSnooze: true,
        SidepanelSwitch: true,
        ConversationSidebar: true,
        Button: true,
      },
    },
  });
  mountedWrapper = wrapper;

  return { wrapper, dispatch, routerPush, routerReplace };
};

describe('ConversationView', () => {
  it('opens the routed conversation through the native store during mount', () => {
    const { dispatch } = mountView();

    expect(dispatch).toHaveBeenCalledWith(
      'abravelyConversationPanel/openConversation',
      'conversation-1'
    );
  });

  it('clears a stale selected conversation when the route has no conversation id', () => {
    const { wrapper, dispatch } = mountView({
      conversationId: 0,
      currentChat: { id: 'previous-conversation' },
    });

    expect(dispatch).toHaveBeenCalledWith(
      'abravelyConversationPanel/clearSelectedConversation'
    );
    expect(wrapper.findComponent({ name: 'AbravelyConversationPanel' }).exists()).toBe(
      false
    );
    expect(
      wrapper.findComponent({ name: 'ConversationEmptyState' }).exists()
    ).toBe(true);
  });

  it('keeps the message panel mounted while a routed conversation loads', () => {
    const { wrapper, dispatch } = mountView({
      conversationId: 'conversation-not-in-list-yet',
      currentChat: {},
    });

    expect(dispatch).toHaveBeenCalledWith(
      'abravelyConversationPanel/openConversation',
      'conversation-not-in-list-yet'
    );
    expect(wrapper.findComponent({ name: 'AbravelyConversationPanel' }).exists()).toBe(
      true
    );
  });

  it('clears the selected state only after the conversation view unmounts', () => {
    const { wrapper, dispatch } = mountView({
      conversationId: 'conversation-1',
      currentChat: conversation,
    });

    wrapper.unmount();
    mountedWrapper = null;

    expect(dispatch).toHaveBeenCalledWith(
      'abravelyConversationPanel/clearSelectedConversation'
    );
  });

  it('closes the selected conversation when Escape is pressed', async () => {
    const { dispatch, routerReplace } = mountView({
      conversationId: 'conversation-1',
      currentChat: conversation,
    });

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(
      'abravelyConversationPanel/clearSelectedConversation'
    );
    expect(routerReplace).toHaveBeenCalledWith({
      name: 'home',
      params: { accountId: '1' },
    });
  });
});
