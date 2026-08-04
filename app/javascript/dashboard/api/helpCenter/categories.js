/* global axios */

const baseUrl = '/api/v1/help/categories';

class CategoriesAPI {
  get() {
    return axios.get(baseUrl);
  }

  create({ categoryObj }) {
    return axios.post(baseUrl, categoryObj);
  }

  update({ categoryId, categoryObj }) {
    return axios.patch(`${baseUrl}/${categoryId}`, categoryObj);
  }

  delete({ categoryId }) {
    return axios.delete(`${baseUrl}/${categoryId}`);
  }

  reorder({ reorderedGroup }) {
    return axios.post(`${baseUrl}/reorder`, { positions: reorderedGroup });
  }
}

export default new CategoriesAPI();
