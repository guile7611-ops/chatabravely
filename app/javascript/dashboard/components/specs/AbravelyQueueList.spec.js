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
  it('keeps native filter and ordering controls available', async () => {
    const wrapper = mountQueueList({
      'abravelyConversationPanel/getQueue': () => [
        { id: 'read', unread_count: 0, updated_at: 10, meta: { sender: { name: 'Ana' } } },
        { id: 'unread', unread_count: 2, updated_at: 20, meta: { sender: { name: 'Bia' } } },
      ],
      'abravelyConversationPanel/getQueueMeta': () => ({}),
      'abravelyConversationPanel/getIsLoadingQueue': false,
    });

    expect(wrapper.find('[aria-label="Filtrar conversas"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Ordenar conversas"]').exists()).toBe(true);

    await wrapper.find('[aria-label="Filtrar conversas"]').trigger('click');
    await wrapper.vm.setUnreadFilter(true);
    expect(wrapper.vm.visibleConversations.map(item => item.id)).toEqual(['unread']);

    wrapper.vm.toggleSortDirection();
    expect(wrapper.vm.sortDirection).toBe('asc');
  });
});
