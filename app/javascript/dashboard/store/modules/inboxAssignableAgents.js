// The Chatwoot assignment endpoint was removed. Assignment in Abravely is
// handled by the conversations API; this only keeps shared widgets inert.
export default {
  namespaced: true,
  state: () => ({ uiFlags: { isFetching: false } }),
  getters: {
    getUIFlags: state => state.uiFlags,
    getAssignableAgents: () => () => [],
  },
  actions: { fetch: () => Promise.resolve([]) },
};
