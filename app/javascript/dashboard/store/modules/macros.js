// Compatibility facade: macros are not exposed by Abravely yet.
export default {
  namespaced: true,
  state: () => ({ records: [], uiFlags: { isFetching: false } }),
  getters: {
    getMacros: state => state.records,
    getUIFlags: state => state.uiFlags,
  },
  actions: {
    get: () => Promise.resolve([]),
    execute: () => Promise.resolve(null),
  },
};
