import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import * as types from '../mutation-types';
import AccountAPI from '../../api/account';
import OnboardingAPI from '../../api/onboarding';
import { differenceInDays } from 'date-fns';
import EnterpriseAccountAPI from '../../api/enterprise/account';
import { throwErrorMessage } from '../utils/api';
import { getLanguageDirection } from 'dashboard/components/widgets/conversation/advancedFilterItems/languages';

const defaultAccount = {
  id: 1,
  name: 'Abravely Chat',
  role: 'administrator',
  status: 'active',
  locale: 'pt_BR',
  created_at: new Date().toISOString(),
  features: {}
};

const findRecordById = ($state, id) =>
  $state.records.find(record => record.id === Number(id)) || defaultAccount;

const TRIAL_PERIOD_DAYS = 15;

const state = {
  records: [defaultAccount],
  uiFlags: {
    isFetching: false,
    isFetchingItem: false,
    isUpdating: false,
    isCheckoutInProcess: false,
    isFetchingLimits: false,
  },
};

export const getters = {
  getAccount: $state => id => {
    return findRecordById($state, id);
  },
  getUIFlags($state) {
    return $state.uiFlags;
  },
  isRTL: ($state, _getters, rootState, rootGetters) => {
    const accountId = Number(rootState.route?.params?.accountId) || 1;
    const userLocale = rootGetters?.getUISettings?.locale;
    const accountLocale =
      accountId && findRecordById($state, accountId)?.locale;

    const effectiveLocale = userLocale ?? accountLocale ?? 'pt_BR';

    return effectiveLocale ? getLanguageDirection(effectiveLocale) : false;
  },
  isTrialAccount: $state => id => {
    const account = findRecordById($state, id);
    const createdAt = new Date(account.created_at || Date.now());
    const diffDays = differenceInDays(new Date(), createdAt);

    return diffDays <= TRIAL_PERIOD_DAYS;
  },
  isFeatureEnabledonAccount: $state => (id, featureName) => {
    const { features = {} } = findRecordById($state, id);
    return features[featureName] ?? true;
  },
};

export const actions = {
  get: async ({ commit }, { silent } = {}) => {
    if (!silent) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isFetchingItem: true });
    }
    try {
      const response = await AccountAPI.get();
      commit(types.default.ADD_ACCOUNT, response.data);
    } catch {
      // silent failure, fallback to default account
      commit(types.default.ADD_ACCOUNT, defaultAccount);
    } finally {
      if (!silent) {
        commit(types.default.SET_ACCOUNT_UI_FLAG, { isFetchingItem: false });
      }
    }
  },
  update: async ({ commit }, { options, ...updateObj }) => {
    if (options?.silent !== true) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    }

    try {
      const response = await AccountAPI.update('', updateObj);
      commit(types.default.EDIT_ACCOUNT, response.data);
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    }
  },
  finishOnboarding: async ({ commit }, payload) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      const response = await OnboardingAPI.update(payload);
      commit(types.default.EDIT_ACCOUNT, response.data);
    } finally {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    }
  },
  delete: async ({ commit }, { id }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      await AccountAPI.delete(id);
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    }
  },
  toggleDeletion: async (
    { commit },
    { action_type } = { action_type: 'delete' }
  ) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      await EnterpriseAccountAPI.toggleDeletion(action_type);
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    }
  },
  create: async ({ commit }, accountInfo) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isCreating: true });
    try {
      const response = await AccountAPI.createAccount(accountInfo);
      const account_id = response.data.data.account_id;
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isCreating: false });
      return account_id;
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isCreating: false });
      return 1;
    }
  },

  checkout: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isCheckoutInProcess: false });
  },

  subscription: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isCheckoutInProcess: false });
  },

  limits: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isFetchingLimits: false });
  },

  getCacheKeys: async () => {
    return AccountAPI.getCacheKeys();
  },
};

export const mutations = {
  [types.default.SET_ACCOUNT_UI_FLAG]($state, data) {
    $state.uiFlags = {
      ...$state.uiFlags,
      ...data,
    };
  },
  [types.default.ADD_ACCOUNT]: MutationHelpers.setSingleRecord,
  [types.default.EDIT_ACCOUNT]: MutationHelpers.update,
  [types.default.SET_ACCOUNT_LIMITS]: MutationHelpers.updateAttributes,
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
