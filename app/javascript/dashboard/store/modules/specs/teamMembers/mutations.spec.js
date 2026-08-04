import {
  mutations,
  ADD_AGENTS_TO_TEAM,
  SET_TEAM_MEMBERS_ERROR,
} from '../../teamMembers';
import teamMembers from './fixtures';

describe('#mutations', () => {
  describe('#SET_TEAM_MEMBERS_ERROR', () => {
    it('Sets error state', () => {
      const state = { error: null };
      mutations[SET_TEAM_MEMBERS_ERROR](state, 'Erro de conexao');
      expect(state.error).toEqual('Erro de conexao');
    });
  });

  describe('#ADD_AGENTS_TO_TEAM', () => {
    it('Adds team members to records', () => {
      const state = { records: {} };
      mutations[ADD_AGENTS_TO_TEAM](state, { data: teamMembers[0], teamId: 1 });
      expect(state.records).toEqual({ 1: teamMembers[0] });
    });
  });
});
