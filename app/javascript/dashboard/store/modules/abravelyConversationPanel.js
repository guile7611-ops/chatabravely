import ConversationApi from '../../api/abravely/conversations';

const QUEUES = ['RECEPTION', 'DEPARTMENT', 'CONVERSATION', 'CLOSED'];

const state = () => ({
  conversationsByQueue: {},
  queueMeta: {},
  selectedConversation: null,
  isLoadingQueue: false,
  isLoadingConversation: false,
  error: null,
});

const getters = {
  getQueue: $state => queue => $state.conversationsByQueue[queue] || [],
  getQueueMeta: $state => queue => $state.queueMeta[queue] || {},
  getSelectedConversation: $state => $state.selectedConversation,
  getError: $state => $state.error,
  getIsLoadingQueue: $state => $state.isLoadingQueue,
  getIsLoadingConversation: $state => $state.isLoadingConversation,
};

const mutations = {
  SET_QUEUE_LOADING($state, value) {
    $state.isLoadingQueue = value;
  },
  SET_CONVERSATION_LOADING($state, value) {
    $state.isLoadingConversation = value;
  },
  SET_ERROR($state, error) {
    $state.error = error;
  },
  SET_QUEUE($state, { queue, conversations, meta }) {
    $state.conversationsByQueue = {
      ...$state.conversationsByQueue,
      [queue]: conversations,
    };
    $state.queueMeta = {
      ...$state.queueMeta,
      [queue]: meta || {},
    };
  },
  SET_SELECTED_CONVERSATION($state, conversation) {
    $state.selectedConversation = conversation;
  },
  CLEAR_SELECTED_CONVERSATION($state) {
    $state.selectedConversation = null;
  },
};

const getErrorMessage = error =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Não foi possível concluir a operação.';

const actions = {
  async fetchQueue({ commit }, { queue, params = {} }) {
    if (!QUEUES.includes(queue)) {
      throw new Error('Fila de conversa inválida.');
    }

    commit('SET_ERROR', null);
    commit('SET_QUEUE_LOADING', true);
    try {
      const response = await ConversationApi.list({ ...params, queue });
      commit('SET_QUEUE', {
        queue,
        conversations: response.payload || response.conversations || [],
        meta: response.meta,
      });
      return response;
    } catch (error) {
      commit('SET_ERROR', getErrorMessage(error));
      throw error;
    } finally {
      commit('SET_QUEUE_LOADING', false);
    }
  },

  async openConversation({ commit }, conversationId) {
    commit('SET_ERROR', null);
    commit('SET_CONVERSATION_LOADING', true);
    try {
      const response = await ConversationApi.show(conversationId);
      commit('SET_SELECTED_CONVERSATION', response.conversation);
      return response.conversation;
    } catch (error) {
      commit('SET_ERROR', getErrorMessage(error));
      throw error;
    } finally {
      commit('SET_CONVERSATION_LOADING', false);
    }
  },

  clearSelectedConversation({ commit }) {
    commit('CLEAR_SELECTED_CONVERSATION');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
