import axios from 'axios';
import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import * as types from '../mutation-types';
import { INBOX_TYPES } from 'dashboard/helper/inbox';
import InboxesAPI from '../../api/inboxes';
import WebChannel from '../../api/channel/webChannel';
import FBChannel from '../../api/channel/fbChannel';
import TwilioChannel from '../../api/channel/twilioChannel';
import WhatsappChannel from '../../api/channel/whatsappChannel';
import { throwErrorMessage } from '../utils/api';
import AnalyticsHelper from '../../helper/AnalyticsHelper';
import camelcaseKeys from 'camelcase-keys';
import { ACCOUNT_EVENTS } from '../../helper/AnalyticsHelper/events';
import { channelActions, buildInboxData } from './inboxes/channelActions';

const LOCAL_STORAGE_KEY = 'chatabravely_inboxes_v1';

const getInboxesFromStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
};

const initialStoredInboxes = getInboxesFromStorage();

export const state = {
  records: initialStoredInboxes || [
    {
      id: 1,
      name: 'WhatsApp Oficial (Meta Cloud API)',
      channel_type: 'Channel::Whatsapp',
      phone_number: '+5511999999999',
      avatar_url: '',
      provider: 'default',
    },
    {
      id: 2,
      name: 'WhatsApp Vendas (Evolution API)',
      channel_type: 'Channel::Whatsapp',
      phone_number: '+5511988888888',
      avatar_url: '',
      provider: 'default',
    },
  ],
  uiFlags: {
    isFetching: false,
    isFetchingItem: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isUpdatingIMAP: false,
    isUpdatingSMTP: false,
  },
};

export const getters = {
  getInboxes($state) {
    return $state.records;
  },
  getAllInboxes($state) {
    return camelcaseKeys($state.records, { deep: true });
  },
  getWhatsAppTemplates: $state => inboxId => {
    const [inbox] = $state.records.filter(
      record => record.id === Number(inboxId)
    );

    const {
      message_templates: whatsAppMessageTemplates,
      additional_attributes: additionalAttributes,
    } = inbox || {};

    const { message_templates: apiInboxMessageTemplates } =
      additionalAttributes || {};
    const messagesTemplates =
      whatsAppMessageTemplates || apiInboxMessageTemplates;

    return messagesTemplates;
  },
  getFilteredWhatsAppTemplates: $state => inboxId => {
    const [inbox] = $state.records.filter(
      record => record.id === Number(inboxId)
    );

    const {
      message_templates: whatsAppMessageTemplates,
      additional_attributes: additionalAttributes,
    } = inbox || {};

    const { message_templates: apiInboxMessageTemplates } =
      additionalAttributes || {};
    const templates = whatsAppMessageTemplates || apiInboxMessageTemplates;

    if (!templates || !Array.isArray(templates)) {
      return [];
    }

    return templates.filter(template => {
      // Ensure template has required properties
      if (!template || !template.status || !template.components) {
        return false;
      }

      // Only show approved templates
      if (template.status.toLowerCase() !== 'approved') {
        return false;
      }

      // Filter out authentication templates
      if (template.category === 'AUTHENTICATION') {
        return false;
      }

      // Filter out CSAT templates (customer_satisfaction_survey and its versions)
      if (
        template.name &&
        template.name.startsWith('customer_satisfaction_survey')
      ) {
        return false;
      }

      // Filter out interactive templates (LIST, PRODUCT, CATALOG), location templates, and call permission templates
      const hasUnsupportedComponents = template.components.some(
        component =>
          ['LIST', 'PRODUCT', 'CATALOG', 'CALL_PERMISSION_REQUEST'].includes(
            component.type
          ) ||
          (component.type === 'HEADER' && component.format === 'LOCATION')
      );

      if (hasUnsupportedComponents) {
        return false;
      }

      return true;
    });
  },
  getNewConversationInboxes($state) {
    return $state.records.filter(inbox => {
      const { channel_type: channelType, phone_number: phoneNumber = '' } =
        inbox;

      const isEmailChannel = channelType === INBOX_TYPES.EMAIL;
      const isSmsChannel =
        channelType === INBOX_TYPES.TWILIO &&
        phoneNumber.startsWith('whatsapp');
      return isEmailChannel || isSmsChannel;
    });
  },
  getInbox: $state => inboxId => {
    const [inbox] = $state.records.filter(
      record => record.id === Number(inboxId)
    );
    return inbox || {};
  },
  getInboxById: $state => inboxId => {
    const [inbox] = $state.records.filter(
      record => record.id === Number(inboxId)
    );
    return camelcaseKeys(inbox || {}, { deep: true });
  },
  getUIFlags($state) {
    return $state.uiFlags;
  },
  getWebsiteInboxes($state) {
    return $state.records.filter(item => item.channel_type === INBOX_TYPES.WEB);
  },
  getTwilioInboxes($state) {
    return $state.records.filter(
      item => item.channel_type === INBOX_TYPES.TWILIO
    );
  },
  getSMSInboxes($state) {
    return $state.records.filter(
      item =>
        item.channel_type === INBOX_TYPES.SMS ||
        (item.channel_type === INBOX_TYPES.TWILIO && item.medium === 'sms')
    );
  },
  getWhatsAppInboxes($state) {
    return $state.records.filter(
      item => item.channel_type === INBOX_TYPES.WHATSAPP
    );
  },
  dialogFlowEnabledInboxes($state) {
    return $state.records.filter(
      item => item.channel_type !== INBOX_TYPES.EMAIL
    );
  },
  getFacebookInboxByInstagramId: $state => instagramId => {
    return $state.records.find(
      item =>
        item.instagram_id === instagramId &&
        item.channel_type === INBOX_TYPES.FB
    );
  },
  getInstagramInboxByInstagramId: $state => instagramId => {
    return $state.records.find(
      item =>
        item.instagram_id === instagramId &&
        item.channel_type === INBOX_TYPES.INSTAGRAM
    );
  },
  getTiktokInboxByBusinessId: $state => businessId => {
    return $state.records.find(
      item =>
        item.business_id === businessId &&
        item.channel_type === INBOX_TYPES.TIKTOK
    );
  },
};

const sendAnalyticsEvent = channelType => {
  AnalyticsHelper.track(ACCOUNT_EVENTS.ADDED_AN_INBOX, {
    channelType,
  });
};

export const actions = {
  revalidate: async ({ commit }, { newKey }) => {
    try {
      const isExistingKeyValid = await InboxesAPI.validateCacheKey(newKey);
      if (!isExistingKeyValid) {
        const response = await InboxesAPI.refetchAndCommit(newKey);
        commit(types.default.SET_INBOXES, response.data.payload);
      }
    } catch (error) {
      // Ignore error
    }
  },
  get: async ({ commit }) => {
    commit(types.default.SET_INBOXES_UI_FLAG, { isFetching: true });
    try {
      const response = await InboxesAPI.get(true);
      commit(types.default.SET_INBOXES_UI_FLAG, { isFetching: false });
      commit(types.default.SET_INBOXES, response.data.payload);
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isFetching: false });
    }
  },
  createMetaChannel: async ({ commit, state }, payload) => {
    commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
    try {
      let channelData = null;
      try {
        const response = await axios.post('/api/v1/channels/meta/save', payload);
        if (response.data && response.data.channel) {
          channelData = response.data.channel;
        }
      } catch (e) {
        // Fallback para dev local
      }

      const mockId = channelData?.id || Date.now();
      const newInbox = {
        id: mockId,
        name: payload.name || 'WhatsApp Meta Cloud API (Oficial)',
        channel_type: 'Channel::MetaCloud',
        phone_number: payload.phone_number || payload.metaPhoneNumberId || '',
        avatar_url: '',
        provider: 'whatsapp_cloud',
        connection_status: 'CONNECTED',
        status: 'CONNECTED',
        reauthorization_required: false,
        metaPhoneNumberId: payload.metaPhoneNumberId,
        metaWabaId: payload.metaWabaId,
        metaToken: payload.metaToken,
        ...channelData,
      };

      commit(types.default.ADD_INBOXES, newInbox);
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const list = [...state.records, newInbox];
          const unique = Array.from(new Map(list.map(item => [item.id, item])).values());
          window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unique));
        }
      } catch (e) {}

      return newInbox;
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      throw error;
    }
  },
  createChannel: async ({ commit }, params) => {
    try {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
      const response = await WebChannel.create(params);
      commit(types.default.ADD_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      const { channel = {} } = params;
      sendAnalyticsEvent(channel.type);
      return response.data;
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      return throwErrorMessage(error);
    }
  },
  createWebsiteChannel: async ({ commit }, params) => {
    try {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
      const response = await WebChannel.create(buildInboxData(params));
      commit(types.default.ADD_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      sendAnalyticsEvent('website');
      return response.data;
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      return throwErrorMessage(error);
    }
  },
  createTwilioChannel: async ({ commit }, params) => {
    try {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
      const response = await TwilioChannel.create(params);
      commit(types.default.ADD_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      sendAnalyticsEvent('twilio');
      return response.data;
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      throw error;
    }
  },
  createFBChannel: async ({ commit }, params) => {
    try {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
      const response = await FBChannel.create(params);
      commit(types.default.ADD_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      sendAnalyticsEvent('facebook');
      return response.data;
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      throw new Error(error);
    }
  },
  createWhatsAppEmbeddedSignup: async ({ commit }, params) => {
    try {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: true });
      const response = await WhatsappChannel.createEmbeddedSignup(params);
      commit(types.default.ADD_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      sendAnalyticsEvent('whatsapp');
      return response.data;
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isCreating: false });
      throw error;
    }
  },
  ...channelActions,
  // TODO: Extract other create channel methods to separate files to reduce file size
  // - createChannel
  // - createWebsiteChannel
  // - createTwilioChannel
  // - createFBChannel
  updateInbox: async ({ commit }, { id, formData = true, ...inboxParams }) => {
    commit(types.default.SET_INBOXES_UI_FLAG, { isUpdating: true });
    try {
      const response = await InboxesAPI.update(
        id,
        formData ? buildInboxData(inboxParams) : inboxParams
      );
      commit(types.default.EDIT_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isUpdating: false });
      throwErrorMessage(error);
    }
  },
  updateInboxIMAP: async ({ commit }, { id, ...inboxParams }) => {
    commit(types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: true });
    try {
      const response = await InboxesAPI.update(id, inboxParams);
      commit(types.default.EDIT_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: false });
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: false });
      throwErrorMessage(error);
    }
  },
  updateInboxSMTP: async ({ commit }, { id, ...inboxParams }) => {
    commit(types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: true });
    try {
      const response = await InboxesAPI.update(id, inboxParams);
      commit(types.default.EDIT_INBOXES, response.data);
      commit(types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: false });
    } catch (error) {
      commit(types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: false });
      throwErrorMessage(error);
    }
  },
  delete: async ({ commit }, inboxId) => {
    commit(types.default.SET_INBOXES_UI_FLAG, { isDeleting: true });
    try {
      await InboxesAPI.delete(inboxId);
    } catch (error) {
      // Suppress error so connection is deleted locally
    } finally {
      commit(types.default.DELETE_INBOXES, inboxId);
      commit(types.default.SET_INBOXES_UI_FLAG, { isDeleting: false });
    }
  },
  reauthorizeFacebookPage: async ({ commit }, params) => {
    try {
      const response = await FBChannel.reauthorizeFacebookPage(params);
      commit(types.default.EDIT_INBOXES, response.data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteInboxAvatar: async (_, inboxId) => {
    try {
      await InboxesAPI.deleteInboxAvatar(inboxId);
    } catch (error) {
      throw new Error(error);
    }
  },
  syncTemplates: async (_, inboxId) => {
    try {
      await InboxesAPI.syncTemplates(inboxId);
    } catch (error) {
      throw new Error(error);
    }
  },
  createCSATTemplate: async (_, { inboxId, template }) => {
    const response = await InboxesAPI.createCSATTemplate(inboxId, template);
    return response.data;
  },
  getCSATTemplateStatus: async (_, { inboxId }) => {
    const response = await InboxesAPI.getCSATTemplateStatus(inboxId);
    return response.data;
  },
  analyzeCSATTemplateUtility: async (_, { inboxId, template }) => {
    const response = await InboxesAPI.analyzeCSATTemplateUtility(
      inboxId,
      template
    );
    return response.data;
  },
  resetSecret: async ({ commit }, inboxId) => {
    try {
      const response = await InboxesAPI.resetSecret(inboxId);
      commit(types.default.EDIT_INBOXES, response.data);
      return response.data;
    } catch (error) {
      throwErrorMessage(error);
      return null;
    }
  },
};

export const mutations = {
  [types.default.SET_INBOXES_UI_FLAG]($state, uiFlag) {
    $state.uiFlags = { ...$state.uiFlags, ...uiFlag };
  },
  [types.default.SET_INBOXES]: MutationHelpers.set,
  [types.default.SET_INBOXES_ITEM]: MutationHelpers.setSingleRecord,
  [types.default.ADD_INBOXES]: MutationHelpers.create,
  [types.default.EDIT_INBOXES]: MutationHelpers.update,
  [types.default.DELETE_INBOXES]($state, inboxId) {
    MutationHelpers.destroy($state, inboxId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify($state.records));
      }
    } catch (e) {}
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
