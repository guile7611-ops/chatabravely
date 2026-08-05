/* global axios */
import ApiClient from './ApiClient';

export class TeamsAPI extends ApiClient {
  constructor() {
    super('departments');
  }

  getAgents({ teamId }) {
    return axios.get(`${this.url}/${teamId}/members`);
  }

  addAgents({ teamId, agentsList }) {
    return axios.post(`${this.url}/${teamId}/members`, {
      user_ids: agentsList,
    });
  }

  updateAgents({ teamId, agentsList }) {
    return axios.patch(`${this.url}/${teamId}/members`, {
      user_ids: agentsList,
    });
  }
}

export default new TeamsAPI();
