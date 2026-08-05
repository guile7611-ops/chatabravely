import {
  SET_TEAM_UI_FLAG,
  CLEAR_TEAMS,
  SET_TEAMS,
  SET_TEAM_ITEM,
  EDIT_TEAM,
  DELETE_TEAM,
  SET_TEAM_ERROR,
} from './types';
import TeamsAPI from '../../../api/teams';

export const actions = {
  create: async ({ commit }, teamInfo) => {
    commit(SET_TEAM_ERROR, null);
    commit(SET_TEAM_UI_FLAG, { isCreating: true });
    try {
      const response = await TeamsAPI.create(teamInfo);
      const team = response.data.data;
      commit(SET_TEAM_ITEM, team);
      commit(SET_TEAM_ERROR, null);
      return team;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar departamento';
      commit(SET_TEAM_ERROR, errorMessage);
      throw error;
    } finally {
      commit(SET_TEAM_UI_FLAG, { isCreating: false });
    }
  },
  revalidate: async ({ dispatch }) => dispatch('get'),
  get: async ({ commit }) => {
    commit(SET_TEAM_ERROR, null);
    commit(SET_TEAM_UI_FLAG, { isFetching: true });
    try {
      const { data } = await TeamsAPI.get();
      commit(CLEAR_TEAMS);
      commit(SET_TEAMS, data.data);
      commit(SET_TEAM_ERROR, null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao carregar departamentos';
      commit(SET_TEAM_ERROR, errorMessage);
    } finally {
      commit(SET_TEAM_UI_FLAG, { isFetching: false });
    }
  },

  show: async ({ commit }, { id }) => {
    commit(SET_TEAM_ERROR, null);
    commit(SET_TEAM_UI_FLAG, { isFetchingItem: true });
    try {
      const response = await TeamsAPI.show(id);
      commit(SET_TEAM_ITEM, response.data.data);
      commit(SET_TEAM_ERROR, null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao carregar departamento';
      commit(SET_TEAM_ERROR, errorMessage);
    } finally {
      commit(SET_TEAM_UI_FLAG, {
        isFetchingItem: false,
      });
    }
  },

  update: async ({ commit }, { id, ...updateObj }) => {
    commit(SET_TEAM_ERROR, null);
    commit(SET_TEAM_UI_FLAG, { isUpdating: true });
    try {
      const response = await TeamsAPI.update(id, updateObj);
      commit(EDIT_TEAM, response.data.data);
      commit(SET_TEAM_ERROR, null);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao atualizar departamento';
      commit(SET_TEAM_ERROR, errorMessage);
      throw error;
    } finally {
      commit(SET_TEAM_UI_FLAG, { isUpdating: false });
    }
  },

  delete: async ({ commit }, teamId) => {
    commit(SET_TEAM_ERROR, null);
    commit(SET_TEAM_UI_FLAG, { isDeleting: true });
    try {
      await TeamsAPI.delete(teamId);
      commit(DELETE_TEAM, teamId);
      commit(SET_TEAM_ERROR, null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao remover departamento';
      commit(SET_TEAM_ERROR, errorMessage);
      throw error;
    } finally {
      commit(SET_TEAM_UI_FLAG, { isDeleting: false });
    }
  },
};
