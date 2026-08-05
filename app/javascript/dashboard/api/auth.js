import axios from 'axios';
import Cookies from 'js-cookie';
import endPoints from './endPoints';
import {
  clearCookiesOnLogout,
  deleteIndexedDBOnLogout,
} from '../store/utils/api';
import { getAbravelyJwtToken } from '../helper/abravelyToken';

export default {
  validityCheck() {
    const urlData = endPoints('validityCheck');
    const token = getAbravelyJwtToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return axios.get(urlData.url, { headers });
  },
  logout() {
    const urlData = endPoints('logout');
    const fetchPromise = new Promise((resolve, reject) => {
      axios
        .delete(urlData.url)
        .then(response => {
          deleteIndexedDBOnLogout();
          clearCookiesOnLogout();
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
    return fetchPromise;
  },
  hasAuthCookie() {
    return !!Cookies.get('cw_d_session_info');
  },
  getAuthData() {
    if (this.hasAuthCookie()) {
      const savedAuthInfo = Cookies.get('cw_d_session_info');
      return JSON.parse(savedAuthInfo || '{}');
    }
    return false;
  },
  profileUpdate({ displayName: _displayName, avatar: _avatar, ...profileAttributes }) {
    // A API Abravely trabalha com JSON. Não simulamos envio de arquivo;
    // avatar terá upload próprio quando esse recurso for implementado.
    return axios.patch(endPoints('profileUpdate').url, profileAttributes);
  },

  profilePasswordUpdate({ currentPassword, password, passwordConfirmation }) {
    return axios.patch(endPoints('profilePasswordUpdate').url, {
      currentPassword,
      password,
      passwordConfirmation,
    });
  },

  updateUISettings({ uiSettings }) {
    return axios.put(endPoints('profileUpdate').url, {
      profile: { ui_settings: uiSettings },
    });
  },

  updateAvailability(availabilityData) {
    return axios.post(endPoints('availabilityUpdate').url, {
      profile: { ...availabilityData },
    });
  },

  updateAutoOffline(accountId, autoOffline = false) {
    return axios.post(endPoints('autoOffline').url, {
      profile: { account_id: accountId, auto_offline: autoOffline },
    });
  },

  deleteAvatar() {
    return axios.delete(endPoints('deleteAvatar').url);
  },

  resetPassword({ email }) {
    const urlData = endPoints('resetPassword');
    return axios.post(urlData.url, { email });
  },

  setActiveAccount({ accountId }) {
    const urlData = endPoints('setActiveAccount');
    return axios.put(urlData.url, {
      profile: {
        account_id: accountId,
      },
    });
  },
  resendConfirmation() {
    const urlData = endPoints('resendConfirmation');
    return axios.post(urlData.url);
  },
  resetAccessToken() {
    const urlData = endPoints('resetAccessToken');
    return axios.post(urlData.url);
  },
  getSessions() {
    return axios.get('/api/v1/profile/sessions');
  },
  revokeSession(id) {
    return axios.delete(`/api/v1/profile/sessions/${id}`);
  },
};
