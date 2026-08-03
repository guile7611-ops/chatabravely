export const getters = {
  uiFlags: state => helpCenterId => {
    const uiFlags = state.articles.uiFlags.byId[helpCenterId];
    if (uiFlags) return uiFlags;
    return { isFetching: false, isUpdating: false, isDeleting: false };
  },
  isFetching: state => state.uiFlags.isFetching,
  articleById:
    (...getterArguments) =>
    articleId => {
      const [state] = getterArguments;
      const article = state.articles.byId[articleId];
      if (!article) return undefined;
      return article;
    },
  allArticles: (...getterArguments) => {
    const [state, _getters] = getterArguments;
    const articles = state.articles.allIds
      .map(id => {
        return _getters.articleById(id);
      })
      .filter(article => article !== undefined);
    return articles;
  },
  allArticlesSortedByPosition: (...getterArguments) => {
    const [state, _getters] = getterArguments;
    const articles = state.articles.allIds
      .map(id => _getters.articleById(id))
      .filter(article => article !== undefined);
    // Sort by position so reordered articles stay in correct order after store updates
    return articles.sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
    );
  },
  articleStatus:
    (...getterArguments) =>
    articleId => {
      const [state] = getterArguments;
      const article = state.articles.byId[articleId];
      if (!article) return undefined;
      return article.status;
    },
  getMeta: state => {
    const list = (state.articles.allIds || [])
      .map(id => state.articles.byId[id])
      .filter(a => a && typeof a === 'object' && a.id);

    const allArticlesCount = list.length;
    const articlesCount = list.filter(a => a.status === 'published' || a.status === 1 || !a.status).length;
    const mineArticlesCount = list.length;
    const draftArticlesCount = list.filter(a => a.status === 'draft' || a.status === 0).length;
    const archivedArticlesCount = list.filter(a => a.status === 'archived' || a.status === 2).length;

    return {
      ...state.meta,
      count: allArticlesCount,
      allArticlesCount,
      articlesCount,
      mineArticlesCount,
      draftArticlesCount,
      archivedArticlesCount,
    };
  },
};
