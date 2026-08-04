import categoriesAPI from 'dashboard/api/helpCenter/categories.js';
import types from '../../mutation-types';

export const actions = {
  index: async ({ commit }) => {
    commit(types.SET_UI_FLAG, { isFetching: true });
    try {
      const { data } = await categoriesAPI.get();
      const categories = data.categories || [];
      commit(types.CLEAR_CATEGORIES);
      commit(types.ADD_MANY_CATEGORIES, categories);
      commit(types.ADD_MANY_CATEGORIES_ID, categories.map(category => category.id));
      return categories.map(category => category.id);
    } finally {
      commit(types.SET_UI_FLAG, { isFetching: false });
    }
  },

  create: async ({ commit }, { categoryObj }) => {
    commit(types.SET_UI_FLAG, { isCreating: true });
    try {
      const { data } = await categoriesAPI.create({ categoryObj });
      commit(types.ADD_CATEGORY, data.category);
      commit(types.ADD_CATEGORY_ID, data.category.id);
      return data.category.id;
    } finally {
      commit(types.SET_UI_FLAG, { isCreating: false });
    }
  },

  update: async ({ commit }, { categoryId, categoryObj }) => {
    commit(types.ADD_CATEGORY_FLAG, { uiFlags: { isUpdating: true }, categoryId });
    try {
      const { data } = await categoriesAPI.update({ categoryId, categoryObj });
      commit(types.UPDATE_CATEGORY, data.category);
      return data.category.id;
    } finally {
      commit(types.ADD_CATEGORY_FLAG, { uiFlags: { isUpdating: false }, categoryId });
    }
  },

  delete: async ({ commit }, { categoryId }) => {
    commit(types.ADD_CATEGORY_FLAG, { uiFlags: { isDeleting: true }, categoryId });
    try {
      await categoriesAPI.delete({ categoryId });
      commit(types.REMOVE_CATEGORY, categoryId);
      commit(types.REMOVE_CATEGORY_ID, categoryId);
      return categoryId;
    } finally {
      commit(types.ADD_CATEGORY_FLAG, { uiFlags: { isDeleting: false }, categoryId });
    }
  },

  reorder: async ({ commit, state }, { reorderedGroup }) => {
    const oldPositions = Object.keys(reorderedGroup).reduce((positions, id) => {
      positions[id] = state.categories.byId[id]?.position;
      return positions;
    }, {});
    commit(types.SET_CATEGORY_POSITIONS, reorderedGroup);
    try {
      await categoriesAPI.reorder({ reorderedGroup });
    } catch (error) {
      commit(types.SET_CATEGORY_POSITIONS, oldPositions);
      throw error;
    }
  },
};
