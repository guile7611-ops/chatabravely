import ConversationApi from '../../api/abravely/conversations';

const QUEUES = ['RECEPTION', 'DEPARTMENT', 'CONVERSATION', 'CLOSED'];

const state = () => ({
  conversationsByQueue: {},
  queueMeta: {},
  activeQueue: 'RECEPTION',
  selectedConversation: null,
  isLoadingQueue: false,
  isLoadingConversation: false,
  error: null,
});

const getters = {
  getQueue: $state => queue => $state.conversationsByQueue[queue] || [],
  getQueueMeta: $state => queue => $state.queueMeta[queue] || {},
  getActiveQueue: $state => $state.activeQueue,
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
  SET_ACTIVE_QUEUE($state, queue) {
    $state.activeQueue = queue;
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
  UPSERT_REALTIME_CONVERSATION($state, conversation) {
    if (!conversation?.id) return;

    let previousConversation = null;
    const conversationsByQueue = Object.fromEntries(
      Object.entries($state.conversationsByQueue).map(([queue, conversations]) => {
        const matchingConversation = conversations.find(
          item => String(item.id) === String(conversation.id)
        );
        previousConversation ||= matchingConversation || null;
        return [
          queue,
          conversations.filter(item => String(item.id) !== String(conversation.id)),
        ];
      })
    );

    const mergedConversation = {
      ...previousConversation,
      ...conversation,
      messages:
        conversation.messages?.length > 0
          ? conversation.messages
          : previousConversation?.messages || [],
    };
    const queue = mergedConversation.queue;

    if (QUEUES.includes(queue)) {
      conversationsByQueue[queue] = [
        mergedConversation,
        ...(conversationsByQueue[queue] || []),
      ];
    }

    $state.conversationsByQueue = conversationsByQueue;
    if (String($state.selectedConversation?.id) === String(conversation.id)) {
      $state.selectedConversation = {
        ...$state.selectedConversation,
        ...mergedConversation,
      };
    }
  },
  APPEND_REALTIME_MESSAGE($state, message) {
    const conversationId = message?.conversation_id || message?.conversationId;
    if (!conversationId) return;

    const conversationsByQueue = Object.fromEntries(
      Object.entries($state.conversationsByQueue).map(([queue, conversations]) => [
        queue,
        conversations.map(conversation => {
          if (String(conversation.id) !== String(conversationId)) return conversation;

          const messages = conversation.messages || [];
          if (messages.some(item => String(item.id) === String(message.id))) {
            return conversation;
          }

          return {
            ...conversation,
            messages: [...messages, message],
            last_activity_at: message.created_at || conversation.last_activity_at,
          };
        }),
      ])
    );

    $state.conversationsByQueue = conversationsByQueue;
    if (String($state.selectedConversation?.id) === String(conversationId)) {
      const messages = $state.selectedConversation.messages || [];
      if (!messages.some(item => String(item.id) === String(message.id))) {
        $state.selectedConversation = {
          ...$state.selectedConversation,
          messages: [...messages, message],
        };
      }
    }
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
    commit('SET_ACTIVE_QUEUE', queue);
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

  async refreshActiveQueue({ state, dispatch }) {
    return dispatch('fetchQueue', { queue: state.activeQueue });
  },

  async applyRealtimeConversation({ commit, dispatch }, conversation) {
    commit('UPSERT_REALTIME_CONVERSATION', conversation);
    await dispatch('refreshActiveQueue');
  },

  applyRealtimeMessage({ commit }, message) {
    commit('APPEND_REALTIME_MESSAGE', message);
  },

  async claim({ dispatch }, conversationId) {
    const response = await ConversationApi.claim(conversationId);
    await Promise.all([
      dispatch('openConversation', conversationId),
      dispatch('refreshActiveQueue'),
    ]);
    return response;
  },

  async transfer({ dispatch }, { conversationId, departmentId, agentId }) {
    const response = await ConversationApi.transfer(conversationId, {
      departmentId,
      agentId,
    });
    await Promise.all([
      dispatch('openConversation', conversationId),
      dispatch('refreshActiveQueue'),
    ]);
    return response;
  },

  async close({ dispatch }, { conversationId, reason }) {
    const response = await ConversationApi.close(conversationId, { reason });
    await Promise.all([
      dispatch('openConversation', conversationId),
      dispatch('refreshActiveQueue'),
    ]);
    return response;
  },

  async reopen({ dispatch }, conversationId) {
    const response = await ConversationApi.reopen(conversationId);
    await Promise.all([
      dispatch('openConversation', conversationId),
      dispatch('refreshActiveQueue'),
    ]);
    return response;
  },

  async sendMessage({ dispatch }, { conversationId, content, isPrivate, avatarPill }) {
    const response = await ConversationApi.sendMessage(conversationId, {
      content,
      isPrivate,
      avatarPill,
    });
    await dispatch('openConversation', conversationId);
    return response;
  },

  async sendTemplate({ dispatch }, { conversationId, ...payload }) {
    const response = await ConversationApi.sendTemplate(conversationId, payload);
    await dispatch('openConversation', conversationId);
    return response;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
