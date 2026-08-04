/* global axios */

const baseUrl = '/api/v1/help/articles';

class ArticlesAPI {
  getArticles({ status, categorySlug, categoryId, authorId, query } = {}) {
    return axios.get(baseUrl, {
      params: {
        ...(status ? { status } : {}),
        ...(categorySlug ? { categorySlug } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(authorId ? { authorId } : {}),
        ...(query ? { search: query } : {}),
      },
    });
  }

  searchArticles({ query } = {}) {
    return this.getArticles({ query });
  }

  getArticle({ id }) {
    return axios.get(`${baseUrl}/${id}`);
  }

  updateArticle({ articleId, articleObj }) {
    return axios.patch(`${baseUrl}/${articleId}`, articleObj);
  }

  createArticle({ articleObj }) {
    return axios.post(baseUrl, articleObj);
  }

  deleteArticle({ articleId }) {
    return axios.delete(`${baseUrl}/${articleId}`);
  }

  reorderArticles({ reorderedGroup }) {
    return axios.post(`${baseUrl}/reorder`, { positions: reorderedGroup });
  }

  bulkUpdateStatus({ articleIds, status }) {
    return axios.patch(`${baseUrl}/bulk/status`, { ids: articleIds, status });
  }

  bulkUpdateCategory({ articleIds, categoryId }) {
    return axios.patch(`${baseUrl}/bulk/category`, { ids: articleIds, categoryId });
  }

  bulkDelete({ articleIds }) {
    return axios.delete(`${baseUrl}/bulk`, { data: { ids: articleIds } });
  }
}

export default new ArticlesAPI();
