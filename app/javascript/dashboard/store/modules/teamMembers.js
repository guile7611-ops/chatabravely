import TeamsAPI from '../../api/teams';

export const SET_TEAM_MEMBERS_UI_FLAG = 'SET_TEAM_MEMBERS_UI_FLAG';
export const ADD_AGENTS_TO_TEAM = 'ADD_AGENTS_TO_TEAM';
export const SET_TEAM_MEMBERS_ERROR = 'SET_TEAM_MEMBERS_ERROR';

export const state = {
  records: {},
  error: null,
  uiFlags: {
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
};

export const getters = {
  getError(_state) {
    return _state.error;
  },
  getUIFlags(_state) {
    return _state.uiFlags;
  },
  getTeamMembers: $state => id => {
    return $state.records[id] || [];
  },
};

export const actions = {
  get: async ({ commit }, { teamId }) => {
    commit(SET_TEAM_MEMBERS_ERROR, null);
    commit(SET_TEAM_MEMBERS_UI_FLAG, { isFetching: true });
    try {
      const { data } = await TeamsAPI.getAgents({ teamId });
      commit(ADD_AGENTS_TO_TEAM, { data, teamId });
      commit(SET_TEAM_MEMBERS_ERROR, null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao carregar membros do time';
      commit(SET_TEAM_MEMBERS_ERROR, errorMessage);
    } finally {
      commit(SET_TEAM_MEMBERS_UI_FLAG, { isFetching: false });
    }
  },
  create: async ({ commit }, { agentsList, teamId }) => {
    commit(SET_TEAM_MEMBERS_ERROR, null);
    commit(SET_TEAM_MEMBERS_UI_FLAG, { isCreating: true });
    try {
      const { data } = await TeamsAPI.addAgents({ agentsList, teamId });
      commit(ADD_AGENTS_TO_TEAM, { teamId, data });
      commit(SET_TEAM_MEMBERS_ERROR, null);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao adicionar membros ao time';
      commit(SET_TEAM_MEMBERS_ERROR, errorMessage);
      throw error;
    } finally {
      commit(SET_TEAM_MEMBERS_UI_FLAG, { isCreating: false });
    }
  },
  update: async ({ commit }, { agentsList, teamId }) => {
    commit(SET_TEAM_MEMBERS_ERROR, null);
    commit(SET_TEAM_MEMBERS_UI_FLAG, { isUpdating: true });
    try {
      const response = await TeamsAPI.updateAgents({
        agentsList,
        teamId,
      });
      const data = response.data || response;
      commit(ADD_AGENTS_TO_TEAM, { teamId, data });
      commit(SET_TEAM_MEMBERS_ERROR, null);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao atualizar membros do time';
      commit(SET_TEAM_MEMBERS_ERROR, errorMessage);
      throw error;
    } finally {
      commit(SET_TEAM_MEMBERS_UI_FLAG, { isUpdating: false });
    }
  },
  delete: async ({ commit }, { agentsList, teamId }) => {
    commit(SET_TEAM_MEMBERS_ERROR, null);
    commit(SET_TEAM_MEMBERS_UI_FLAG, { isDeleting: true });
    try {
      const response = await TeamsAPI.updateAgents({
        agentsList,
        teamId,
      });
      const data = response.data || response;
      commit(ADD_AGENTS_TO_TEAM, { teamId, data });
      commit(SET_TEAM_MEMBERS_ERROR, null);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao remover membro do time';
      commit(SET_TEAM_MEMBERS_ERROR, errorMessage);
      throw error;
    } finally {
      commit(SET_TEAM_MEMBERS_UI_FLAG, { isDeleting: false });
    }
  },
};

export const mutations = {
  [SET_TEAM_MEMBERS_ERROR]($state, error) {
    $state.error = error;
  },
  [SET_TEAM_MEMBERS_UI_FLAG]($state, data) {
    $state.uiFlags = {
      ...$state.uiFlags,
      ...data,
    };
  },
  [ADD_AGENTS_TO_TEAM]($state, { data, teamId }) {
    $state.records = {
      ...$state.records,
      [teamId]: data,
    };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
