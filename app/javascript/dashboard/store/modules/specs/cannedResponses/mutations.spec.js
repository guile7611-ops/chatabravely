import types from '../../../mutation-types';
import cannedResponse from '../../cannedResponse';

const { mutations } = cannedResponse;

describe('#cannedResponse mutations', () => {
  describe('#SET_CANNED_ERROR', () => {
    it('sets error state', () => {
      const state = { error: null };
      mutations[types.SET_CANNED_ERROR](state, 'Erro ao carregar');
      expect(state.error).toEqual('Erro ao carregar');
    });
  });

  describe('#SET_CANNED', () => {
    it('set canned records', () => {
      const state = { records: [] };
      mutations[types.SET_CANNED](state, [{ id: 1, short_code: 'hi' }]);
      expect(state.records).toEqual([{ id: 1, short_code: 'hi' }]);
    });
  });
});
