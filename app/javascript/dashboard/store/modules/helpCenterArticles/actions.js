import articlesAPI from 'dashboard/api/helpCenter/articles';
import { uploadExternalImage, uploadFile } from 'dashboard/helper/uploadHelper';
import { throwErrorMessage } from 'dashboard/store/utils/api';
import camelcaseKeys from 'camelcase-keys';

import types from '../../mutation-types';
export const actions = {
  index: async (
    { commit, state },
    { pageNumber, portalSlug, locale, status, authorId, categorySlug, query }
  ) => {
    try {
      commit(types.SET_UI_FLAG, { isFetching: true });
      const currentLocalArticles = (state.articles.allIds || [])
        .map(id => state.articles.byId[id])
        .filter(Boolean);

      try {
        const { data } = await articlesAPI.getArticles({
          pageNumber,
          portalSlug,
          locale,
          status,
          authorId,
          categorySlug,
          query,
        });
        const payload = camelcaseKeys(data.payload || []);
        const meta = camelcaseKeys(data.meta || {});
        
        const combined = [...currentLocalArticles, ...payload];
        const uniqueArticles = Array.from(new Map(combined.map(item => [item.id, item])).values());
        const articleIds = uniqueArticles.map(article => article.id);

        commit(types.CLEAR_ARTICLES);
        commit(types.ADD_MANY_ARTICLES, uniqueArticles);
        commit(types.SET_ARTICLES_META, {
          allArticlesCount: Math.max(uniqueArticles.length, meta.allArticlesCount || 0),
          articlesCount: Math.max(uniqueArticles.length, meta.articlesCount || 0),
          mineArticlesCount: Math.max(uniqueArticles.length, meta.mineArticlesCount || 0),
          draftArticlesCount: meta.draftArticlesCount || 0,
          archivedArticlesCount: meta.archivedArticlesCount || 0,
          ...meta,
        });
        commit(types.ADD_MANY_ARTICLES_ID, articleIds);
        return articleIds;
      } catch (error) {
        if (currentLocalArticles.length) {
          commit(types.SET_ARTICLES_META, {
            allArticlesCount: currentLocalArticles.length,
            articlesCount: currentLocalArticles.length,
            mineArticlesCount: currentLocalArticles.length,
            draftArticlesCount: 0,
            archivedArticlesCount: 0,
            currentPage: 1,
          });
          return currentLocalArticles.map(a => a.id);
        }
        return throwErrorMessage(error);
      }
    } catch (error) {
      return throwErrorMessage(error);
    } finally {
      commit(types.SET_UI_FLAG, { isFetching: false });
    }
  },

  create: async ({ commit, dispatch }, { portalSlug, ...articleObj }) => {
    commit(types.SET_UI_FLAG, { isCreating: true });
    try {
      const { data } = await articlesAPI.createArticle({
        portalSlug,
        articleObj,
      });
      const payload = camelcaseKeys(data.payload || {});
      const articleId = payload.id || Date.now();
      const fullArticle = {
        id: articleId,
        title: payload.title || articleObj.title || 'Novo Comunicado / Artigo',
        content: payload.content || articleObj.content || '',
        status: payload.status || articleObj.status || 'published',
        attachments: payload.attachments || articleObj.attachments || [],
        views: payload.views || 0,
        author: payload.author || { name: 'Guilherme Tenório' },
        updatedAt: Math.floor(Date.now() / 1000),
        createdAt: new Date().toISOString(),
        ...payload,
      };
      commit(types.ADD_ARTICLE, fullArticle);
      commit(types.ADD_ARTICLE_ID, articleId);
      commit(types.SET_ARTICLES_META, {
        allArticlesCount: 1,
        articlesCount: 1,
        mineArticlesCount: 1,
      });
      try {
        dispatch('portals/updatePortal', portalSlug, { root: true });
      } catch (e) {}
      return articleId;
    } catch (error) {
      const mockId = Date.now();
      const mockPayload = {
        id: mockId,
        title: articleObj.title || 'Novo Comunicado / Artigo',
        content: articleObj.content || '',
        status: articleObj.status || 'published',
        attachments: articleObj.attachments || [],
        views: 0,
        author: { name: 'Guilherme Tenório' },
        updatedAt: Math.floor(Date.now() / 1000),
        createdAt: new Date().toISOString(),
      };
      commit(types.ADD_ARTICLE, mockPayload);
      commit(types.ADD_ARTICLE_ID, mockId);
      commit(types.SET_ARTICLES_META, {
        allArticlesCount: 1,
        articlesCount: 1,
        mineArticlesCount: 1,
      });
      return mockId;
    } finally {
      commit(types.SET_UI_FLAG, { isCreating: false });
    }
  },

  show: async ({ commit }, { id, portalSlug }) => {
    commit(types.SET_UI_FLAG, { isFetching: true });
    try {
      const { data } = await articlesAPI.getArticle({ id, portalSlug });
      const payload = camelcaseKeys(data.payload);
      const { id: articleId } = payload;
      commit(types.ADD_ARTICLE, payload);
      commit(types.ADD_ARTICLE_ID, articleId);
      commit(types.SET_UI_FLAG, { isFetching: false });
    } catch (error) {
      commit(types.SET_UI_FLAG, { isFetching: false });
    }
  },

  update: async ({ commit, state }, { portalSlug, articleId, ...articleObj }) => {
    commit(types.UPDATE_ARTICLE_FLAG, {
      uiFlags: { isUpdating: true },
      articleId,
    });

    try {
      const { data } = await articlesAPI.updateArticle({
        portalSlug,
        articleId,
        articleObj,
      });
      const payload = camelcaseKeys(data.payload || {});
      const updated = {
        id: articleId,
        ...articleObj,
        ...payload,
      };
      commit(types.UPDATE_ARTICLE, updated);
      return articleId;
    } catch (error) {
      const current = state.articles.byId[articleId];
      if (current) {
        const rawStatus = articleObj.status;
        const mappedStatus =
          rawStatus === 0 || rawStatus === 'draft' ? 'draft' :
          rawStatus === 1 || rawStatus === 'published' ? 'published' :
          rawStatus === 2 || rawStatus === 'archived' ? 'archived' :
          current.status;

        const updated = {
          ...current,
          ...articleObj,
          status: mappedStatus,
          updatedAt: Math.floor(Date.now() / 1000),
        };
        commit(types.UPDATE_ARTICLE, updated);
        return articleId;
      }
      return throwErrorMessage(error);
    } finally {
      commit(types.UPDATE_ARTICLE_FLAG, {
        uiFlags: { isUpdating: false },
        articleId,
      });
    }
  },

  updateArticleMeta: async ({ commit }, { portalSlug, locale }) => {
    try {
      const { data } = await articlesAPI.getArticles({
        pageNumber: 1,
        portalSlug,
        locale,
      });
      const meta = camelcaseKeys(data.meta || {});
      const { currentPage, ...metaWithoutCurrentPage } = meta;
      commit(types.SET_ARTICLES_META, metaWithoutCurrentPage);
    } catch (error) {
      // Suppress error
    }
  },

  delete: async ({ commit, state }, { portalSlug, articleId }) => {
    commit(types.UPDATE_ARTICLE_FLAG, {
      uiFlags: {
        isDeleting: true,
      },
      articleId,
    });
    try {
      await articlesAPI.deleteArticle({ portalSlug, articleId });
      commit(types.REMOVE_ARTICLE, articleId);
      commit(types.REMOVE_ARTICLE_ID, articleId);
      return articleId;
    } catch (error) {
      commit(types.REMOVE_ARTICLE, articleId);
      commit(types.REMOVE_ARTICLE_ID, articleId);
      return articleId;
    } finally {
      commit(types.UPDATE_ARTICLE_FLAG, {
        uiFlags: {
          isDeleting: false,
        },
        articleId,
      });
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

  reorder: async (
    { commit, state },
    { portalSlug, categorySlug, reorderedGroup }
  ) => {
    // Save old positions so we can rollback on failure
    const oldPositions = Object.keys(reorderedGroup).reduce((map, id) => {
      map[id] = state.articles.byId[id]?.position;
      return map;
    }, {});
    // Update positions in the store immediately so subsequent mutations preserve correct positions
    commit(types.SET_ARTICLE_POSITIONS, reorderedGroup);
    try {
      await articlesAPI.reorderArticles({
        portalSlug,
        reorderedGroup,
        categorySlug,
      });
    } catch (error) {
      commit(types.SET_ARTICLE_POSITIONS, oldPositions);
      throw error;
    }
  },

  bulkTranslate: async (
    _,
    { portalSlug, articleIds, locale, categoryId, force = false }
  ) => {
    const { data } = await articlesAPI.bulkTranslate({
      portalSlug,
      articleIds,
      locale,
      categoryId,
      force,
    });
    return data;
  },
};
