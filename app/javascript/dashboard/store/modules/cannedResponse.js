import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import * as types from '../mutation-types';
import CannedResponseAPI from '../../api/cannedResponse';

const state = {
  records: [],
  error: null,
  uiFlags: {
    fetchingList: false,
    fetchingItem: false,
    creatingItem: false,
    updatingItem: false,
    deletingItem: false,
  },
};

const getters = {
  getCannedResponses(_state) {
    return _state.records;
  },
  getError(_state) {
    return _state.error;
  },
  getSortedCannedResponses(_state) {
    return sortOrder =>
      [..._state.records].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.short_code.localeCompare(b.short_code);
        }
        return b.short_code.localeCompare(a.short_code);
      });
  },
  getUIFlags(_state) {
    return _state.uiFlags;
  },
};

const actions = {
  getCannedResponse: async function getCannedResponse(
    { commit },
    { searchKey } = {}
  ) {
    commit(types.default.SET_CANNED_ERROR, null);
    commit(types.default.SET_CANNED_UI_FLAG, { fetchingList: true });
    try {
      const response = await CannedResponseAPI.get({ searchKey });
      commit(types.default.SET_CANNED, response.data);
      commit(types.default.SET_CANNED_ERROR, null);
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao carregar respostas rápidas';
      commit(types.default.SET_CANNED_ERROR, errorMessage);
      throw error;
    } finally {
      commit(types.default.SET_CANNED_UI_FLAG, { fetchingList: false });
    }
  },

  createCannedResponse: async function createCannedResponse(
    { commit },
    cannedObj
  ) {
    commit(types.default.SET_CANNED_ERROR, null);
    commit(types.default.SET_CANNED_UI_FLAG, { creatingItem: true });
    try {
      const response = await CannedResponseAPI.create(cannedObj);
      commit(types.default.ADD_CANNED, response.data);
      commit(types.default.SET_CANNED_ERROR, null);
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao criar resposta rápida';
      commit(types.default.SET_CANNED_ERROR, errorMessage);
      throw new Error(errorMessage);
    } finally {
      commit(types.default.SET_CANNED_UI_FLAG, { creatingItem: false });
    }
  },

  updateCannedResponse: async function updateCannedResponse(
    { commit },
    { id, ...updateObj }
  ) {
    commit(types.default.SET_CANNED_ERROR, null);
    commit(types.default.SET_CANNED_UI_FLAG, { updatingItem: true });
    try {
      const response = await CannedResponseAPI.update(id, updateObj);
      commit(types.default.EDIT_CANNED, response.data);
      commit(types.default.SET_CANNED_ERROR, null);
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao atualizar resposta rápida';
      commit(types.default.SET_CANNED_ERROR, errorMessage);
      throw new Error(errorMessage);
    } finally {
      commit(types.default.SET_CANNED_UI_FLAG, { updatingItem: false });
    }
  },

  deleteCannedResponse: async function deleteCannedResponse({ commit }, id) {
    commit(types.default.SET_CANNED_ERROR, null);
    commit(types.default.SET_CANNED_UI_FLAG, { deletingItem: true });
    try {
      await CannedResponseAPI.delete(id);
      commit(types.default.DELETE_CANNED, id);
      commit(types.default.SET_CANNED_ERROR, null);
      return id;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao excluir resposta rápida';
      commit(types.default.SET_CANNED_ERROR, errorMessage);
      throw new Error(errorMessage);
    } finally {
      commit(types.default.SET_CANNED_UI_FLAG, { deletingItem: false });
    }
  },
};

const mutations = {
  [types.default.SET_CANNED_UI_FLAG](_state, data) {
    _state.uiFlags = {
      ..._state.uiFlags,
      ...data,
    };
  },
  [types.default.SET_CANNED_ERROR](_state, error) {
    _state.error = error;
  },

  [types.default.SET_CANNED]: MutationHelpers.set,
  [types.default.ADD_CANNED]: MutationHelpers.create,
  [types.default.EDIT_CANNED]: MutationHelpers.update,
  [types.default.DELETE_CANNED]: MutationHelpers.destroy,
};

export default {
  state,
  getters,
  actions,
  mutations,
};
