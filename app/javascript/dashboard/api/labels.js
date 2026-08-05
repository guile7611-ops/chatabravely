import ApiClient from './ApiClient';

class LabelsAPI extends ApiClient {
  constructor() {
    super('labels');
  }
}

export default new LabelsAPI();
