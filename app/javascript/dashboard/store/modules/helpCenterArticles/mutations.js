import types from '../../mutation-types';

const recalculateMeta = ($state) => {
  const list = ($state.articles.allIds || [])
    .map(id => $state.articles.byId[id])
    .filter(a => a && typeof a === 'object' && a.id);

  const allArticlesCount = list.length;
  const articlesCount = list.filter(a => a.status === 'published' || a.status === 1 || !a.status).length;
  const mineArticlesCount = list.length;
  const draftArticlesCount = list.filter(a => a.status === 'draft' || a.status === 0).length;
  const archivedArticlesCount = list.filter(a => a.status === 'archived' || a.status === 2).length;

  $state.meta = {
    ...$state.meta,
    count: allArticlesCount,
    allArticlesCount,
    articlesCount,
    mineArticlesCount,
    draftArticlesCount,
    archivedArticlesCount,
  };
};

export const mutations = {
  [types.SET_UI_FLAG](_state, uiFlags) {
    _state.uiFlags = {
      ..._state.uiFlags,
      ...uiFlags,
    };
  },

  [types.ADD_ARTICLE]: ($state, article) => {
    if (!article.id) return;

    $state.articles.byId[article.id] = article;
    recalculateMeta($state);
  },
  [types.CLEAR_ARTICLES]: $state => {
    $state.articles.allIds = [];
    $state.articles.byId = {};
    $state.articles.uiFlags.byId = {};
  },
  [types.ADD_MANY_ARTICLES]($state, articles) {
    const allArticles = { ...$state.articles.byId };
    articles.forEach(article => {
      allArticles[article.id] = article;
    });

    $state.articles.byId = allArticles;
    recalculateMeta($state);
  },
  [types.ADD_MANY_ARTICLES_ID]($state, articleIds) {
    $state.articles.allIds.push(...articleIds);
    recalculateMeta($state);
  },

  [types.SET_ARTICLES_META]: ($state, meta) => {
    $state.meta = {
      ...$state.meta,
      ...meta,
    };
  },

  [types.ADD_ARTICLE_ID]: ($state, articleId) => {
    if ($state.articles.allIds.includes(articleId)) return;
    $state.articles.allIds.push(articleId);
    recalculateMeta($state);
  },
  [types.UPDATE_ARTICLE_FLAG]: ($state, { articleId, uiFlags }) => {
    const flags = $state.articles.uiFlags.byId[articleId] || {};

    $state.articles.uiFlags.byId[articleId] = {
      ...{
        isFetching: false,
        isUpdating: false,
        isDeleting: false,
      },
      ...flags,
      ...uiFlags,
    };
  },
  [types.ADD_ARTICLE_FLAG]: ($state, { articleId, uiFlags }) => {
    $state.articles.uiFlags.byId[articleId] = {
      ...{
        isFetching: false,
        isUpdating: false,
        isDeleting: false,
      },
      ...uiFlags,
    };
  },
  [types.SET_ARTICLE_POSITIONS]: ($state, positionsHash) => {
    const { byId, allIds } = $state.articles;
    // Update position on each article record
    Object.entries(positionsHash).forEach(([id, position]) => {
      if (byId[id]) byId[id] = { ...byId[id], position };
    });
    // Re-sort allIds so every consumer sees the new order
    allIds.sort(
      (a, b) =>
        (byId[a]?.position ?? Infinity) - (byId[b]?.position ?? Infinity)
    );
    recalculateMeta($state);
  },
  [types.UPDATE_ARTICLE]: ($state, updatedArticle) => {
    if (!updatedArticle?.id || !$state.articles.byId[updatedArticle.id]) return;
    const articleId = updatedArticle.id;
    const existing = $state.articles.byId[articleId];

    $state.articles.byId[articleId] = {
      ...existing,
      ...updatedArticle,
      position: existing.position,
    };
    recalculateMeta($state);
  },
  [types.REMOVE_ARTICLE]($state, articleId) {
    if (!articleId || !$state.articles.byId[articleId]) return;
    const { [articleId]: toBeRemoved, ...newById } = $state.articles.byId;
    $state.articles.byId = newById;
    recalculateMeta($state);
  },
  [types.REMOVE_ARTICLE_ID]($state, articleId) {
    $state.articles.allIds = $state.articles.allIds.filter(
      id => id !== articleId
    );
    recalculateMeta($state);
  },
};
