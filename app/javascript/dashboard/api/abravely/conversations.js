/* global axios */

/**
 * Cliente HTTP exclusivo do domínio de conversas Abravely.
 *
 * Não usa o ApiClient herdado, que monta URLs no formato
 * `/accounts/:accountId/...` para compatibilidade com o Chatwoot.
 */
const BASE_URL = '/api/v1/conversations';

const unwrap = response => response?.data || {};

export default {
  async list(params = {}) {
    return unwrap(await axios.get(BASE_URL, { params }));
  },

  async show(conversationId) {
    return unwrap(await axios.get(`${BASE_URL}/${conversationId}`));
  },

  async claim(conversationId) {
    return unwrap(await axios.post(`${BASE_URL}/${conversationId}/claim`));
  },

  async transfer(conversationId, data) {
    return unwrap(await axios.post(`${BASE_URL}/${conversationId}/transfer`, data));
  },

  async close(conversationId, data = {}) {
    return unwrap(await axios.post(`${BASE_URL}/${conversationId}/close`, data));
  },

  async reopen(conversationId) {
    return unwrap(await axios.post(`${BASE_URL}/${conversationId}/reopen`));
  },

  async sendMessage(conversationId, data) {
    return unwrap(await axios.post(`${BASE_URL}/${conversationId}/messages`, data));
  },

  async sendTemplate(conversationId, data) {
    return unwrap(
      await axios.post(`${BASE_URL}/${conversationId}/send-template`, data)
    );
  },
};
