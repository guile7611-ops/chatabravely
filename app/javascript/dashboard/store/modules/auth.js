import types from '../mutation-types';
import authAPI from '../../api/auth';

import { setUser, clearCookiesOnLogout } from '../utils/api';
import {
  getAbravelyJwtToken,
  fetchAndStoreAbravelyJwtToken,
  clearAbravelyJwtToken,
} from 'dashboard/helper/abravelyToken';
import { disconnectSocketIo } from 'dashboard/helper/socketIoConnector';
import SessionStorage from 'shared/helpers/sessionStorage';
import { SESSION_STORAGE_KEYS } from 'dashboard/constants/sessionStorage';

const initialState = {
  currentUser: {
    id: 1,
    account_id: 1,
    locale: 'pt_BR',
    ui_settings: {
      locale: 'pt_BR',
      theme: 'dark',
    },
    accounts: [
      {
        id: 1,
        name: 'Abravely Chat',
        role: 'administrator',
        status: 'active',
        availability: 'online',
        locale: 'pt_BR',
        permissions: ['administrator', 'agent'],
      },
    ],
    email: 'guilherme.tenorio@multione.com',
    name: 'Guilherme Tenorio',
    role: 'administrator',
  },
  uiFlags: {
    isFetching: false,
  },
};

// getters
export const getters = {
  isLoggedIn($state) {
    return !!$state.currentUser.id;
  },

  getCurrentUserID($state) {
    return $state.currentUser.id;
  },

  getUISettings($state) {
    return $state.currentUser.ui_settings || {};
  },

  getAuthUIFlags($state) {
    return $state.uiFlags;
  },

  getCurrentUserAvailability($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.availability || 'online';
  },

  getCurrentUserAutoOffline($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.auto_offline;
  },

  getCurrentAccountId($state, _, rootState) {
    if (rootState?.route?.params?.accountId) {
      return Number(rootState.route.params.accountId);
    }
    return 1;
  },

  getCurrentRole($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.role || 'administrator';
  },

  getCurrentCustomRoleId($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.custom_role_id;
  },

  getCurrentUser($state) {
    return $state.currentUser;
  },

  getMessageSignature($state) {
    const { message_signature: messageSignature } = $state.currentUser;
    return messageSignature || '';
  },

  getCurrentAccount($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount || { id: 1, name: 'Abravely Chat', role: 'administrator' };
  },

  getUserAccounts($state) {
    const { accounts = [] } = $state.currentUser;
    return accounts;
  },
};

// actions
export const actions = {
  async loginWithCredentials({ commit }, { email, password }) {
    const token = await fetchAndStoreAbravelyJwtToken(email, password);
    if (!token) {
      throw new Error('Autenticação Abravely falhou: Token JWT não retornado.');
    }
    return token;
  },

  async validityCheck(context) {
    try {
      const response = await authAPI.validityCheck();
      const currentUser = response.data?.payload?.data || response.data;
      if (currentUser) {
        setUser(currentUser);
        context.commit(types.SET_CURRENT_USER, currentUser);
      }
    } catch (error) {
      // Keep mock user in standalone frontend development
    }
  },

  async setUser({ commit, dispatch }) {
    try {
      if (getAbravelyJwtToken() || authAPI.hasAuthCookie()) {
        await dispatch('validityCheck');
      }
    } catch (e) {
      // Ignore auth errors in standalone dev mode
    } finally {
      commit(types.SET_CURRENT_USER_UI_FLAGS, { isFetching: false });
    }
  },

  logout({ commit }) {
    disconnectSocketIo();
    clearAbravelyJwtToken();
    commit(types.CLEAR_USER);
  },

  updateProfile: async ({ commit }, params) => {
    try {
      const response = await authAPI.profileUpdate(params);
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      // Mock update
      commit(types.SET_CURRENT_USER, { ...params, id: 1 });
    }
  },

  updatePassword: async ({ commit }, params) => {
    try {
      const response = await authAPI.profilePasswordUpdate(params);
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      // Ignore
    }
  },

  deleteAvatar: async ({ commit }) => {
    try {
      const response = await authAPI.deleteAvatar();
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      // Ignore
    }
  },

  updateUISettings: async ({ commit }, params) => {
    try {
      commit(types.SET_CURRENT_USER_UI_SETTINGS, params);
    } catch (error) {
      // Ignore
    }
  },

  updateAvailability: async (
    { commit, dispatch, getters: _getters },
    params
  ) => {
    const previousStatus = _getters.getCurrentUserAvailability;
    try {
      commit(types.SET_CURRENT_USER_AVAILABILITY, params.availability);
    } catch (error) {
      commit(types.SET_CURRENT_USER_AVAILABILITY, previousStatus);
    }
  },

  updateAutoOffline: async (
    { commit, getters: _getters },
    { accountId, autoOffline }
  ) => {
    const previousAutoOffline = _getters.getCurrentUserAutoOffline;
    try {
      commit(types.SET_CURRENT_USER_AUTO_OFFLINE, autoOffline);
    } catch (error) {
      commit(types.SET_CURRENT_USER_AUTO_OFFLINE, previousAutoOffline);
    }
  },

  setCurrentUserAvailability({ commit, state: $state }, data) {
    if (data[$state.currentUser.id]) {
      commit(types.SET_CURRENT_USER_AVAILABILITY, data[$state.currentUser.id]);
    }
  },

  setActiveAccount: async (_, { accountId }) => {
    // Ignore
  },

  resetAccessToken: async ({ commit }) => {
    return true;
  },

  resendConfirmation: async () => {
    // Ignore
  },
};

// mutations
export const mutations = {
  [types.SET_CURRENT_USER_AVAILABILITY](_state, availability) {
    const accounts = _state.currentUser.accounts.map(account => {
      if (account.id === _state.currentUser.account_id) {
        return { ...account, availability, availability_status: availability };
      }
      return account;
    });
    _state.currentUser = {
      ..._state.currentUser,
      accounts,
    };
  },
  [types.SET_CURRENT_USER_AUTO_OFFLINE](_state, autoOffline) {
    const accounts = _state.currentUser.accounts.map(account => {
      if (account.id === _state.currentUser.account_id) {
        return { ...account, autoOffline: autoOffline };
      }
      return account;
    });

    _state.currentUser = {
      ..._state.currentUser,
      accounts,
    };
  },
  [types.RESET_ONBOARDING](_state, accountId) {
    const accounts = _state.currentUser.accounts.map(account => {
      if (account.id === accountId) {
        const { onboarding_step, ...rest } = account;
        return rest;
      }
      return account;
    });

    _state.currentUser = {
      ..._state.currentUser,
      accounts,
    };
  },
  [types.CLEAR_USER](_state) {
    _state.currentUser = initialState.currentUser;
  },
  [types.SET_CURRENT_USER]($state, user) {
    const currentLocale = user.locale || user.ui_settings?.locale || localStorage.getItem('user_locale') || 'pt_BR';
    localStorage.setItem('user_locale', currentLocale);
    $state.currentUser = {
      ...$state.currentUser,
      ...user,
      locale: currentLocale,
      ui_settings: {
        ...($state.currentUser?.ui_settings || {}),
        ...(user.ui_settings || {}),
        locale: currentLocale,
      },
    };
    setUser(user, user.accounts ? user.accounts[0]?.id : null);
  },
  [types.SET_CURRENT_USER_UI_SETTINGS](_state, { uiSettings }) {
    _state.currentUser = {
      ..._state.currentUser,
      ui_settings: {
        ..._state.currentUser.ui_settings,
        ...uiSettings,
      },
    };
  },

  [types.SET_CURRENT_USER_UI_FLAGS](_state, { isFetching }) {
    _state.uiFlags = { isFetching };
  },
};

export default {
  state: initialState,
  getters,
  actions,
  mutations,
};
