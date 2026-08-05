// Compatibility facade for the shared list layout. Saved Chatwoot views and
// their API are intentionally unavailable in Abravely.
export default {
  namespaced: true,
  state: () => ({
    conversation: { records: [] },
    contact: { records: [] },
    uiFlags: { isFetching: false, isCreating: false, isDeleting: false },
    activeConversationFolder: null,
  }),
  getters: {
    getUIFlags: state => state.uiFlags,
    getConversationCustomViews: state => state.conversation.records,
    getContactCustomViews: state => state.contact.records,
    getActiveConversationFolder: state => state.activeConversationFolder,
    getActiveFolderContactId: () => null,
  },
  actions: {
    get: () => Promise.resolve([]),
    setActiveConversationFolder: ({ commit }, folder) =>
      commit('SET_ACTIVE_CONVERSATION_FOLDER', folder),
  },
  mutations: {
    SET_ACTIVE_CONVERSATION_FOLDER(state, folder) {
      state.activeConversationFolder = folder;
    },
  },
};
