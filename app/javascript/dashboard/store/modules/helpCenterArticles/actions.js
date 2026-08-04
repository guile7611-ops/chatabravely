import articlesAPI from 'dashboard/api/helpCenter/articles';
import { uploadExternalImage, uploadFile } from 'dashboard/helper/uploadHelper';
import types from '../../mutation-types';

const replaceArticles = (commit, articles, meta = {}) => {
  const ids = articles.map(article => article.id);
  commit(types.CLEAR_ARTICLES);
  commit(types.ADD_MANY_ARTICLES, articles);
  commit(types.ADD_MANY_ARTICLES_ID, ids);
  commit(types.SET_ARTICLES_META, meta);
  return ids;
};

export const actions = {
  index: async ({ commit }, { status, categorySlug, categoryId, authorId, query } = {}) => {
    commit(types.SET_UI_FLAG, { isFetching: true });
    try {
      const { data } = await articlesAPI.getArticles({
        status,
        categorySlug,
        categoryId,
        authorId,
        query,
      });
      return replaceArticles(commit, data.articles || [], data.meta || {});
    } finally {
      commit(types.SET_UI_FLAG, { isFetching: false });
    }
  },

  create: async ({ commit }, { portalSlug: _portalSlug, ...articleObj }) => {
    commit(types.SET_UI_FLAG, { isCreating: true });
    try {
      const { data } = await articlesAPI.createArticle({ articleObj });
      const article = data.article;
      commit(types.ADD_ARTICLE, article);
      commit(types.ADD_ARTICLE_ID, article.id);
      return article.id;
    } finally {
      commit(types.SET_UI_FLAG, { isCreating: false });
    }
  },

  show: async ({ commit }, { id }) => {
    commit(types.SET_UI_FLAG, { isFetching: true });
    try {
      const { data } = await articlesAPI.getArticle({ id });
      commit(types.ADD_ARTICLE, data.article);
      commit(types.ADD_ARTICLE_ID, data.article.id);
      return data.article;
    } finally {
      commit(types.SET_UI_FLAG, { isFetching: false });
    }
  },

  update: async ({ commit }, { portalSlug: _portalSlug, articleId, ...articleObj }) => {
    commit(types.UPDATE_ARTICLE_FLAG, { uiFlags: { isUpdating: true }, articleId });
    try {
      const { data } = await articlesAPI.updateArticle({ articleId, articleObj });
      commit(types.UPDATE_ARTICLE, data.article);
      return data.article.id;
    } finally {
      commit(types.UPDATE_ARTICLE_FLAG, { uiFlags: { isUpdating: false }, articleId });
    }
  },

  updateArticleMeta: async ({ dispatch }) => dispatch('index'),

  delete: async ({ commit }, { articleId }) => {
    commit(types.UPDATE_ARTICLE_FLAG, { uiFlags: { isDeleting: true }, articleId });
    try {
      await articlesAPI.deleteArticle({ articleId });
      commit(types.REMOVE_ARTICLE, articleId);
      commit(types.REMOVE_ARTICLE_ID, articleId);
      return articleId;
    } finally {
      commit(types.UPDATE_ARTICLE_FLAG, { uiFlags: { isDeleting: false }, articleId });
    }
  },

  attachImage: async (_, { file }) => {
    const { fileUrl } = await uploadFile(file);
    return fileUrl;
  },

  uploadExternalImage: async (_, { url }) => {
    const { fileUrl } = await uploadExternalImage(url);
    return fileUrl;
  },

  reorder: async ({ commit, state }, { reorderedGroup }) => {
    const oldPositions = Object.keys(reorderedGroup).reduce((positions, id) => {
      positions[id] = state.articles.byId[id]?.position;
      return positions;
    }, {});
    commit(types.SET_ARTICLE_POSITIONS, reorderedGroup);
    try {
      await articlesAPI.reorderArticles({ reorderedGroup });
    } catch (error) {
      commit(types.SET_ARTICLE_POSITIONS, oldPositions);
      throw error;
    }
  },
};
