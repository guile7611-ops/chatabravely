import { mount } from '@vue/test-utils';
import AbravelyQueueList from '../AbravelyQueueList.vue';

const mountQueueList = getters =>
  mount(AbravelyQueueList, {
    global: {
      mocks: {
        $store: {
          getters,
          dispatch: vi.fn().mockResolvedValue({}),
        },
      },
    },
  });

describe('AbravelyQueueList', () => {
  it('renders safely while the native Vuex module is still being registered', () => {
    const wrapper = mountQueueList({});

    expect(wrapper.text()).toContain('Conversas');
    expect(wrapper.text()).toContain('Não há conversas nesta fila.');
  });

  it('renders the native queue and its server-side counters', () => {
    const conversations = [{
      id: 'conversation-1',
      meta: { sender: { name: 'Ana' } },
      messages: [{ content: 'Olá' }],
    }];
    const wrapper = mountQueueList({
      'abravelyConversationPanel/getQueue': () => conversations,
      'abravelyConversationPanel/getQueueMeta': () => ({
        reception_count: 1,
        departments_count: 2,
        active_count: 3,
      }),
      'abravelyConversationPanel/getIsLoadingQueue': false,
    });

    expect(wrapper.text()).toContain('Recepção 1');
    expect(wrapper.text()).toContain('Ana');
    expect(wrapper.text()).toContain('Olá');
  });
});
