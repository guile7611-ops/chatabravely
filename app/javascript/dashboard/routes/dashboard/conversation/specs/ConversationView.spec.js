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

const mountView = ({
  conversationId = 'conversation-1',
  currentChat = {},
  chatList = [conversation],
} = {}) => {
  const dispatch = vi.fn().mockResolvedValue();
  const store = {
    dispatch,
    getters: {
      getAllConversations: chatList,
      getSelectedChat: currentChat,
      getConversationsError: null,
    },
  };

  const wrapper = mount(ConversationView, {
    props: { conversationId },
    global: {
      mocks: {
        $store: store,
        $route: { params: {}, query: {} },
      },
      stubs: {
        ChatList: true,
        ConversationBox: true,
        CmdBarConversationSnooze: true,
        SidepanelSwitch: true,
        ConversationSidebar: true,
        Button: true,
      },
    },
  });

  return { wrapper, dispatch };
};

describe('ConversationView', () => {
  it('selects the routed conversation during mount without throwing', () => {
    const { dispatch } = mountView();

    expect(dispatch).toHaveBeenCalledWith('setActiveInbox', 0);
    expect(dispatch).toHaveBeenCalledWith('setActiveChat', {
      data: conversation,
      after: undefined,
    });
  });

  it('clears a stale selected conversation when the route has no conversation id', () => {
    const { dispatch } = mountView({
      conversationId: 0,
      currentChat: { id: 'previous-conversation' },
    });

    expect(dispatch).toHaveBeenCalledWith('clearSelectedState');
  });
});
