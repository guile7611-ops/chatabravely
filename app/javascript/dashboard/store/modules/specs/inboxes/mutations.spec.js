import { describe, it, expect } from 'vitest';
import { mutations } from '../../inboxes';
import * as types from '../../../mutation-types';

describe('inboxes/mutations', () => {
  it('SET_INBOX_ERROR', () => {
    const state = { error: null };
    mutations.SET_INBOX_ERROR(state, 'Erro ao conectar canal');
    expect(state.error).toEqual('Erro ao conectar canal');
  });

  it('SET_INBOXES_UI_FLAG', () => {
    const state = { uiFlags: { isFetching: false } };
    mutations[types.default.SET_INBOXES_UI_FLAG](state, { isFetching: true, isCreating: true });
    expect(state.uiFlags).toEqual({ isFetching: true, isCreating: true });
  });

  it('SET_INBOXES', () => {
    const state = { records: [] };
    const records = [{ id: 1, name: 'Inbox 1' }, { id: 2, name: 'Inbox 2' }];
    mutations[types.default.SET_INBOXES](state, records);
    expect(state.records).toEqual(records);
  });

  it('ADD_INBOXES', () => {
    const state = { records: [{ id: 1, name: 'Inbox 1' }] };
    const newInbox = { id: 2, name: 'Inbox 2' };
    mutations[types.default.ADD_INBOXES](state, newInbox);
    expect(state.records).toHaveLength(2);
    expect(state.records[1]).toEqual(newInbox);
  });

  it('EDIT_INBOXES', () => {
    const state = { records: [{ id: 1, name: 'Inbox Antigo' }] };
    const updatedInbox = { id: 1, name: 'Inbox Atualizado' };
    mutations[types.default.EDIT_INBOXES](state, updatedInbox);
    expect(state.records[0].name).toEqual('Inbox Atualizado');
  });

  it('DELETE_INBOXES', () => {
    const state = { records: [{ id: 1, name: 'Inbox 1' }, { id: 2, name: 'Inbox 2' }] };
    mutations[types.default.DELETE_INBOXES](state, 1);
    expect(state.records).toHaveLength(1);
    expect(state.records[0].id).toEqual(2);
  });
});
