import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from '../../inboxes';
import * as types from '../../../mutation-types';

const commit = vi.fn();
const dispatch = vi.fn();
global.axios = axios;
vi.mock('axios');

describe('inboxes/actions', () => {
  beforeEach(() => {
    commit.mockClear();
    dispatch.mockClear();
  });

  describe('#get', () => {
    it('sends correct actions if API is success with list', async () => {
      const inboxList = [{ id: 1, name: 'Inbox 1', channel_type: 'Channel::Whatsapp' }];
      axios.get.mockResolvedValue({ data: { payload: inboxList } });
      await actions.get({ commit });
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: true }],
        [types.default.SET_INBOXES, inboxList],
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: false }],
      ]);
    });

    it('sends correct actions if API is success with empty list', async () => {
      axios.get.mockResolvedValue({ data: { payload: [] } });
      await actions.get({ commit });
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: true }],
        [types.default.SET_INBOXES, []],
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: false }],
      ]);
    });

    it('handles API failure, saves error message, preserves list and finishes fetching status as false', async () => {
      const apiError = { response: { data: { message: 'Erro ao carregar inboxes' } } };
      axios.get.mockRejectedValue(apiError);
      await actions.get({ commit });
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: true }],
        ['SET_INBOX_ERROR', 'Erro ao carregar inboxes'],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: false }],
      ]);
    });

    it('clears error on a new successful attempt after failure', async () => {
      const inboxList = [{ id: 1, name: 'Inbox 1' }];
      axios.get.mockResolvedValue({ data: { payload: inboxList } });
      await actions.get({ commit });
      expect(commit.mock.calls[0]).toEqual(['SET_INBOX_ERROR', null]);
      expect(commit.mock.calls[3]).toEqual(['SET_INBOX_ERROR', null]);
      expect(commit.mock.calls[4]).toEqual([
        types.default.SET_INBOXES_UI_FLAG,
        { isFetching: false },
      ]);
    });
  });

  describe('#delete', () => {
    it('deletes inbox on success', async () => {
      axios.delete.mockResolvedValue({});
      await actions.delete({ commit }, 1);
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: true }],
        [types.default.DELETE_INBOXES, 1],
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: false }],
      ]);
    });

    it('saves error on deletion failure and does not delete locally', async () => {
      const apiError = { response: { data: { message: 'Erro ao deletar inbox' } } };
      axios.delete.mockRejectedValue(apiError);
      await expect(actions.delete({ commit }, 1)).rejects.toEqual(apiError);
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: true }],
        ['SET_INBOX_ERROR', 'Erro ao deletar inbox'],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: false }],
      ]);
    });
  });
});
