// Compatibility facade; no Captain API or tool is loaded by Abravely.
export default {
  namespaced: true,
  state: () => ({ records: [], uiFlags: { isFetching: false } }),
  getters: {
    getRecords: state => state.records,
    getUIFlags: state => state.uiFlags,
  },
};
