import axios from 'axios';
import {
  actions,
  SET_TEAM_MEMBERS_UI_FLAG,
  ADD_AGENTS_TO_TEAM,
  SET_TEAM_MEMBERS_ERROR,
} from '../../teamMembers';
import teamMembers from './fixtures';

const commit = vi.fn();
global.axios = axios;
vi.mock('axios');

describe('#actions', () => {
  beforeEach(() => {
    commit.mockClear();
  });

  describe('#get', () => {
    it('sends correct actions if API is success', async () => {
      axios.get.mockResolvedValue({ data: teamMembers[1] });
      await actions.get({ commit }, { teamId: 1 });
      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isFetching: true }],
        [ADD_AGENTS_TO_TEAM, { data: teamMembers[1], teamId: 1 }],
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isFetching: false }],
      ]);
    });

    it('sends correct actions if API is error and stores real error message before rejecting', async () => {
      axios.get.mockRejectedValue({
        response: { data: { message: 'Erro ao carregar membros do time' } },
      });
      await expect(actions.get({ commit }, { teamId: 1 })).rejects.toThrow();
      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isFetching: true }],
        [SET_TEAM_MEMBERS_ERROR, 'Erro ao carregar membros do time'],
        [SET_TEAM_MEMBERS_UI_FLAG, { isFetching: false }],
      ]);
    });
  });

  describe('#create', () => {
    it('sends correct actions if API is success', async () => {
      axios.post.mockResolvedValue({ data: teamMembers });
      await actions.create({ commit }, { agentsList: teamMembers, teamId: 1 });

      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isCreating: true }],
        [ADD_AGENTS_TO_TEAM, { data: teamMembers, teamId: 1 }],
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isCreating: false }],
      ]);
    });

    it('sends correct actions if API is error', async () => {
      axios.post.mockRejectedValue({
        response: { data: { message: 'Erro ao adicionar membros ao time' } },
      });
      await expect(
        actions.create({ commit }, { agentsList: teamMembers, teamId: 1 })
      ).rejects.toThrow();

      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isCreating: true }],
        [SET_TEAM_MEMBERS_ERROR, 'Erro ao adicionar membros ao time'],
        [SET_TEAM_MEMBERS_UI_FLAG, { isCreating: false }],
      ]);
    });
  });

  describe('#update', () => {
    it('sends correct actions if API is success', async () => {
      axios.patch.mockResolvedValue({ data: teamMembers });
      await actions.update({ commit }, { agentsList: teamMembers, teamId: 1 });

      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isUpdating: true }],
        [ADD_AGENTS_TO_TEAM, { teamId: 1, data: teamMembers }],
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isUpdating: false }],
      ]);
    });

    it('sends correct actions if API is error', async () => {
      axios.patch.mockRejectedValue({
        response: { data: { message: 'Erro ao atualizar membros do time' } },
      });
      await expect(
        actions.update({ commit }, { agentsList: teamMembers, teamId: 1 })
      ).rejects.toThrow();

      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isUpdating: true }],
        [SET_TEAM_MEMBERS_ERROR, 'Erro ao atualizar membros do time'],
        [SET_TEAM_MEMBERS_UI_FLAG, { isUpdating: false }],
      ]);
    });
  });

  describe('#delete', () => {
    it('sends correct actions if API is success', async () => {
      axios.patch.mockResolvedValue({ data: [] });
      await actions.delete({ commit }, { agentsList: [], teamId: 1 });

      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isDeleting: true }],
        [ADD_AGENTS_TO_TEAM, { teamId: 1, data: [] }],
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isDeleting: false }],
      ]);
    });

    it('sends correct actions if API is error', async () => {
      axios.patch.mockRejectedValue({
        response: { data: { message: 'Erro ao remover membro do time' } },
      });
      await expect(
        actions.delete({ commit }, { agentsList: [], teamId: 1 })
      ).rejects.toThrow();

      expect(commit.mock.calls).toEqual([
        [SET_TEAM_MEMBERS_ERROR, null],
        [SET_TEAM_MEMBERS_UI_FLAG, { isDeleting: true }],
        [SET_TEAM_MEMBERS_ERROR, 'Erro ao remover membro do time'],
        [SET_TEAM_MEMBERS_UI_FLAG, { isDeleting: false }],
      ]);
    });
  });
});
