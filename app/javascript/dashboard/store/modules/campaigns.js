// Campaigns are not part of the Abravely product. The facade prevents the
// inherited conversation filters from issuing a legacy Chatwoot request.
export default {
  namespaced: true,
  state: () => ({ records: [], uiFlags: { isFetching: false } }),
  getters: {
    getAllCampaigns: state => state.records,
    getUIFlags: state => state.uiFlags,
    getWhatsAppCampaigns: () => [],
    getSMSCampaigns: () => [],
    getLiveChatCampaigns: () => [],
  },
  actions: { get: () => Promise.resolve([]) },
};
