const STORAGE_KEY = 'chatabravely_help_center_articles_v1';

const persistToStorage = ($state) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const list = ($state.articles.allIds || [])
      .map(id => $state.articles.byId[id])
      .filter(a => a && typeof a === 'object' && a.id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
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
    persistToStorage($state);
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
    persistToStorage($state);
  },
  [types.ADD_MANY_ARTICLES_ID]($state, articleIds) {
    $state.articles.allIds.push(...articleIds);
    persistToStorage($state);
  },

  [types.SET_ARTICLES_META]: ($state, meta) => {
    $state.meta = {
      ...$state.meta,
      ...meta,
    };
  },

  [types.ADD_ARTICLE_ID]: ($state, articleId) => {
    if ($state.articles.allIds.includes(articleId)) return;
    $state.articles.allIds.unshift(articleId);
    persistToStorage($state);
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
    persistToStorage($state);
  },
  [types.UPDATE_ARTICLE]: ($state, updatedArticle) => {
    const articleId = updatedArticle.id;
    if ($state.articles.byId[articleId]) {
      const existing = $state.articles.byId[articleId];

      $state.articles.byId[articleId] = {
        ...existing,
        ...updatedArticle,
        position: existing.position,
      };
    } else {
      $state.articles.byId[articleId] = updatedArticle;
    }
    persistToStorage($state);
  },
  [types.REMOVE_ARTICLE]($state, articleId) {
    const { [articleId]: toBeRemoved, ...newById } = $state.articles.byId;
    $state.articles.byId = newById;
    persistToStorage($state);
  },
  [types.REMOVE_ARTICLE_ID]($state, articleId) {
    $state.articles.allIds = $state.articles.allIds.filter(
      id => id !== articleId
    );
    persistToStorage($state);
  },
};
