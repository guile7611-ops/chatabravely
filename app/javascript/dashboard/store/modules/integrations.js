// Compatibility facade for shared conversation components. Abravely never
// fetches Chatwoot integrations through this module.
export default {
  namespaced: true,
  state: () => ({ uiFlags: { isFetching: false } }),
  getters: {
    getUIFlags: state => state.uiFlags,
    getAppIntegrations: () => [],
    getIntegration: () => () => null,
  },
  actions: { get: () => Promise.resolve([]) },
};
