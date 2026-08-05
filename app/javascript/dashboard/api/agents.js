/* global axios */

import ApiClient from './ApiClient';

class Agents extends ApiClient {
  constructor() {
    super('attendants');
  }

  bulkInvite({ emails }) {
    return Promise.reject(
      new Error(`Convite em massa ainda não está disponível (${emails.length})`)
    );
  }
}

export default new Agents();
