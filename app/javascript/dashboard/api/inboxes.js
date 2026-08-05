/* global axios */
import ApiClient from './ApiClient';

class Inboxes extends ApiClient {
  constructor() {
    super('channels');
  }

  createEvolutionChannel(payload) {
    return axios.post(`${this.url}/evolution/qr`, payload);
  }

  getChannelStatus(channelId) {
    return this.show(channelId);
  }

  createMetaChannel(payload) {
    return axios.post(`${this.url}/meta/save`, payload);
  }

  getApprovedTemplates(channelId) {
    return axios.get(`${this.url}/${channelId}/templates`);
  }
}

export default new Inboxes();
