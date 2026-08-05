// Local selection state for the inherited conversation list. This module does
// not call the removed Chatwoot bulk-actions API.
export default {
  namespaced: true,
  state: () => ({
    selectedConversationIds: [],
    uiFlags: { isFetching: false },
  }),
  getters: {
    getSelectedConversationIds: state => state.selectedConversationIds,
    getUIFlags: state => state.uiFlags,
  },
  actions: {
    setSelectedConversationIds({ commit }, ids) {
      commit('SET_SELECTED_CONVERSATION_IDS', ids);
    },
    removeSelectedConversationIds({ commit }, id) {
      commit('REMOVE_SELECTED_CONVERSATION_ID', id);
    },
    clearSelectedConversationIds({ commit }) {
      commit('CLEAR_SELECTED_CONVERSATION_IDS');
    },
  },
  mutations: {
    SET_SELECTED_CONVERSATION_IDS(state, ids) {
      const values = Array.isArray(ids) ? ids : [ids];
      state.selectedConversationIds = [...new Set(values)];
    },
    REMOVE_SELECTED_CONVERSATION_ID(state, id) {
      state.selectedConversationIds = state.selectedConversationIds.filter(
        selectedId => selectedId !== id
      );
    },
    CLEAR_SELECTED_CONVERSATION_IDS(state) {
      state.selectedConversationIds = [];
    },
  },
};
