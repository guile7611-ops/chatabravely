import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const defaultHelpCenterFlags = {
  isFetching: false,
  isUpdating: false,
  isDeleting: false,
};
const STORAGE_KEY = 'chatabravely_help_center_articles_v1';

const getArticlesFromStorage = () => {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const initialStored = getArticlesFromStorage();
const initialById = {};
const initialAllIds = [];

initialStored.forEach(article => {
  if (article && article.id) {
    initialById[article.id] = article;
    initialAllIds.push(article.id);
  }
});

const state = {
  meta: {
    count: initialStored.length,
    currentPage: 1,
    allArticlesCount: initialStored.length,
    articlesCount: initialStored.length,
    mineArticlesCount: initialStored.length,
    draftArticlesCount: initialStored.filter(a => a.status === 'draft').length,
    archivedArticlesCount: initialStored.filter(a => a.status === 'archived').length,
  },
  articles: {
    byId: initialById,
    allIds: initialAllIds,
    uiFlags: {
      byId: {},
    },
  },
  uiFlags: {
    allFetched: false,
    isFetching: false,
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
