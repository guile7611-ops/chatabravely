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
  chatList = [conversation],
} = {}) => {
  const dispatch = vi.fn().mockResolvedValue();
  const routerPush = vi.fn().mockResolvedValue();
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
        $router: { push: routerPush },
      },
      stubs: {
        ChatList: true,
        ConversationBox: true,
        ConversationEmptyState: true,
        CmdBarConversationSnooze: true,
        SidepanelSwitch: true,
        ConversationSidebar: true,
        Button: true,
      },
    },
  });
  mountedWrapper = wrapper;

  return { wrapper, dispatch, routerPush };
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
    const { wrapper, dispatch } = mountView({
      conversationId: 0,
      currentChat: { id: 'previous-conversation' },
    });

    expect(dispatch).toHaveBeenCalledWith('clearSelectedState');
    expect(wrapper.findComponent({ name: 'ConversationBox' }).exists()).toBe(
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
      chatList: [],
    });

    expect(dispatch).toHaveBeenCalledWith(
      'getConversation',
      'conversation-not-in-list-yet'
    );
    expect(wrapper.findComponent({ name: 'ConversationBox' }).exists()).toBe(
      true
    );
  });

  it('closes the active conversation on Escape', async () => {
    const { wrapper, dispatch, routerPush } = mountView({
      conversationId: 'conversation-1',
      currentChat: conversation,
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(dispatch).toHaveBeenCalledWith('clearSelectedState');
    expect(routerPush).toHaveBeenCalledWith({
      name: 'home',
      params: { accountId: 1 },
    });
  });

  it('authorizes leaving an open conversation using the Vue Router 4 return contract', () => {
    const { wrapper, dispatch } = mountView({
      conversationId: 'conversation-1',
      currentChat: conversation,
    });

    const result = wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm);

    expect(dispatch).toHaveBeenCalledWith('clearSelectedState');
    expect(result).toBe(true);
  });
});
