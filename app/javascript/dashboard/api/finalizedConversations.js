/* global axios */

const baseUrl = '/api/v1/reports/finalized';

export default {
  get(params = {}) {
    return axios.get(baseUrl, { params });
  },
};
