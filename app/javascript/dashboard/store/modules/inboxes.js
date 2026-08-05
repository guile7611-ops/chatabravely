import camelcaseKeys from 'camelcase-keys';
import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import * as types from '../mutation-types';
import InboxesAPI from '../../api/inboxes';

export const state = {
  records: [],
  error: null,
  uiFlags: {
    isFetching: false,
    isFetchingItem: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
};

const normalizeChannel = channel => ({
  ...channel,
  id: channel.id,
  channel_id: channel.id,
  channel_type: 'Channel::Whatsapp',
  phone_number:
    channel.metaPhoneNumberId || channel.evolutionInstanceName || '',
  provider: channel.type,
  medium: channel.type === 'META_CLOUD' ? 'meta' : 'evolution',
  connection_status:
    channel.connectionStatus || channel.connection_status || 'DISCONNECTED',
});

const apiErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

export const getters = {
  getInboxesError: $state => $state.error,
  getInboxes: $state => $state.records,
  getAllInboxes: $state => camelcaseKeys($state.records, { deep: true }),
  getInbox: $state => inboxId =>
    $state.records.find(record => String(record.id) === String(inboxId)) || {},
  getInboxById: $state => inboxId =>
    camelcaseKeys(
      $state.records.find(record => String(record.id) === String(inboxId)) ||
        {},
      { deep: true }
    ),
  getUIFlags: $state => $state.uiFlags,
  getWhatsAppInboxes: $state => $state.records,
  getNewConversationInboxes: $state =>
    $state.records.filter(channel => channel.connection_status === 'CONNECTED'),
  dialogFlowEnabledInboxes: () => [],
  getWhatsAppTemplates: $state => inboxId => {
    const inbox = $state.records.find(
      record => String(record.id) === String(inboxId)
    );
    return (
      inbox?.message_templates ||
      inbox?.additional_attributes?.message_templates ||
      []
    );
  },
  getFilteredWhatsAppTemplates: (_state, localGetters) => inboxId =>
    localGetters.getWhatsAppTemplates(inboxId).filter(template => {
      if (template?.status?.toLowerCase() !== 'approved') return false;
      if (template.category === 'AUTHENTICATION') return false;
      if (template.name?.startsWith('customer_satisfaction_survey')) {
        return false;
      }
      return !(template.components || []).some(
        component =>
          ['LIST', 'PRODUCT', 'CATALOG', 'CALL_PERMISSION_REQUEST'].includes(
            component.type
          ) ||
          (component.type === 'HEADER' && component.format === 'LOCATION')
      );
    }),
};

export const actions = {
  async get({ commit }) {
    commit('SET_INBOX_ERROR', null);
    commit(types.default.SET_INBOXES_UI_FLAG, { isFetching: true });
    try {
      const response = await InboxesAPI.get();
      const channels = response.data?.channels || response.data?.data || [];
      commit(types.default.SET_INBOXES, channels.map(normalizeChannel));
    } catch (error) {
      commit(
        'SET_INBOX_ERROR',
        apiErrorMessage(error, 'Erro ao carregar canais')
      );
      throw error;
    } finally {
      commit(types.default.SET_INBOXES_UI_FLAG, { isFetching: false });
    }
  },
  async createMetaChannel({ commit }, payload) {
    commit('SET_INBOX_ERROR', null);
    commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
    try {
      const response = await InboxesAPI.createMetaChannel(payload);
      const channel = normalizeChannel(response.data?.channel || response.data);
      commit(types.default.ADD_INBOXES, channel);
      return channel;
    } catch (error) {
      commit(
        'SET_INBOX_ERROR',
        apiErrorMessage(error, 'Erro ao criar canal Meta Cloud API')
      );
      throw error;
    } finally {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
    }
  },
  async createEvolutionChannel({ commit }, payload) {
    commit('SET_INBOX_ERROR', null);
    commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
    try {
      const response = await InboxesAPI.createEvolutionChannel(payload);
      const channel = normalizeChannel({
        id: response.data.channelId,
        name: payload.name,
        type: 'EVOLUTION',
        connectionStatus: response.data.connectionStatus,
        evolutionInstanceName: response.data.instanceName,
      });
      commit(types.default.ADD_INBOXES, channel);
      return { ...response.data, channel };
    } catch (error) {
      commit(
        'SET_INBOX_ERROR',
        apiErrorMessage(error, 'Não foi possível conectar a Evolution Go.')
      );
      throw error;
    } finally {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
    }
  },
  async delete({ commit }, inboxId) {
    commit('SET_INBOX_ERROR', null);
    commit(types.default.SET_INBOXES_UI_FLAG, { isDeleting: true });
    try {
      await InboxesAPI.delete(inboxId);
      commit(types.default.DELETE_INBOXES, inboxId);
    } catch (error) {
      commit(
        'SET_INBOX_ERROR',
        apiErrorMessage(error, 'Erro ao remover canal')
      );
      throw error;
    } finally {
      commit(types.default.SET_INBOXES_UI_FLAG, { isDeleting: false });
    }
  },
  async syncTemplates({ commit, state: currentState }, inboxId) {
    try {
      const response = await InboxesAPI.getApprovedTemplates(inboxId);
      const templates = response.data?.templates || [];
      commit(
        types.default.SET_INBOXES,
        currentState.records.map(record =>
          String(record.id) === String(inboxId)
            ? { ...record, message_templates: templates }
            : record
        )
      );
      return templates;
    } catch (error) {
      commit(
        'SET_INBOX_ERROR',
        apiErrorMessage(error, 'Erro ao sincronizar templates da Meta')
      );
      throw error;
    }
  },
};

export const mutations = {
  SET_INBOX_ERROR($state, error) {
    $state.error = error;
  },
  [types.default.SET_INBOXES_UI_FLAG]($state, uiFlag) {
    $state.uiFlags = { ...$state.uiFlags, ...uiFlag };
  },
  [types.default.SET_INBOXES]($state, records) {
    MutationHelpers.set($state, Array.isArray(records) ? records : []);
  },
  [types.default.SET_INBOXES_ITEM]: MutationHelpers.setSingleRecord,
  [types.default.ADD_INBOXES]: MutationHelpers.create,
  [types.default.EDIT_INBOXES]: MutationHelpers.update,
  [types.default.DELETE_INBOXES]($state, inboxId) {
    const index = $state.records.findIndex(
      record => String(record.id) === String(inboxId)
    );
    if (index >= 0) $state.records.splice(index, 1);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
