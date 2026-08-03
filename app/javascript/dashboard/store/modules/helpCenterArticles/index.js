import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const defaultHelpCenterFlags = {
  isFetching: false,
  isUpdating: false,
  isDeleting: false,
};
const state = {
  meta: {
    count: 0,
    currentPage: 1,
    allArticlesCount: 0,
    articlesCount: 0,
    mineArticlesCount: 0,
    draftArticlesCount: 0,
    archivedArticlesCount: 0,
  },
  articles: {
    byId: {},
    allIds: [],
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
