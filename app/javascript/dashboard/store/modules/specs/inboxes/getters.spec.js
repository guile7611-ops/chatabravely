import { describe, it, expect } from 'vitest';
import { getters } from '../../inboxes';

describe('inboxes/getters', () => {
  it('getError', () => {
    const state = {
      error: 'Mensagem de erro de teste em inboxes',
    };
    expect(getters.getError(state)).toEqual('Mensagem de erro de teste em inboxes');
  });

  it('getInboxes', () => {
    const state = {
      records: [{ id: 1, name: 'Inbox 1' }],
    };
    expect(getters.getInboxes(state)).toEqual([{ id: 1, name: 'Inbox 1' }]);
  });
});
