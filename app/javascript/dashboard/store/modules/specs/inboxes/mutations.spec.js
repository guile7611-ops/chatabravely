import { describe, it, expect } from 'vitest';
import { mutations } from '../../inboxes';

describe('inboxes/mutations', () => {
  it('SET_INBOX_ERROR', () => {
    const state = { error: null };
    mutations.SET_INBOX_ERROR(state, 'Erro ao conectar canal');
    expect(state.error).toEqual('Erro ao conectar canal');
  });
});
