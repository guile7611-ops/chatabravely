import axios from 'axios';
import cannedResponse from '../../cannedResponse';
import * as types from '../../../mutation-types';

const { actions } = cannedResponse;
const commit = vi.fn();
global.axios = axios;
vi.mock('axios');

describe('#cannedResponse actions', () => {
  beforeEach(() => {
    commit.mockClear();
  });

  describe('#getCannedResponse', () => {
    it('sends correct actions if API is success', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1, short_code: 'hi', content: 'Hello' }] });
      await actions.getCannedResponse({ commit });
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { fetchingList: true }],
        [types.default.SET_CANNED, [{ id: 1, short_code: 'hi', content: 'Hello' }]],
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { fetchingList: false }],
      ]);
    });

    it('sends correct actions if API is error and throws', async () => {
      axios.get.mockRejectedValue({ message: 'Error fetching' });
      await expect(actions.getCannedResponse({ commit })).rejects.toThrow();
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { fetchingList: true }],
        [types.default.SET_CANNED_ERROR, 'Error fetching'],
        [types.default.SET_CANNED_UI_FLAG, { fetchingList: false }],
      ]);
    });
  });

  describe('#createCannedResponse', () => {
    it('sends correct actions if API is success', async () => {
      axios.post.mockResolvedValue({ data: { id: 1, short_code: 'hi' } });
      await actions.createCannedResponse({ commit }, { short_code: 'hi', content: 'Hello' });
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { creatingItem: true }],
        [types.default.ADD_CANNED, { id: 1, short_code: 'hi' }],
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { creatingItem: false }],
      ]);
    });

    it('sends correct actions if API is error', async () => {
      axios.post.mockRejectedValue({ message: 'Error creating' });
      await expect(actions.createCannedResponse({ commit }, { short_code: 'hi' })).rejects.toThrow('Error creating');
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { creatingItem: true }],
        [types.default.SET_CANNED_ERROR, 'Error creating'],
        [types.default.SET_CANNED_UI_FLAG, { creatingItem: false }],
      ]);
    });
  });

  describe('#updateCannedResponse', () => {
    it('sends correct actions if API is success', async () => {
      axios.patch.mockResolvedValue({ data: { id: 1, short_code: 'hi' } });
      await actions.updateCannedResponse({ commit }, { id: 1, short_code: 'hi' });
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { updatingItem: true }],
        [types.default.EDIT_CANNED, { id: 1, short_code: 'hi' }],
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { updatingItem: false }],
      ]);
    });

    it('sends correct actions if API is error', async () => {
      axios.patch.mockRejectedValue({ message: 'Error updating' });
      await expect(actions.updateCannedResponse({ commit }, { id: 1 })).rejects.toThrow('Error updating');
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { updatingItem: true }],
        [types.default.SET_CANNED_ERROR, 'Error updating'],
        [types.default.SET_CANNED_UI_FLAG, { updatingItem: false }],
      ]);
    });
  });

  describe('#deleteCannedResponse', () => {
    it('sends correct actions if API is success', async () => {
      axios.delete.mockResolvedValue({});
      await actions.deleteCannedResponse({ commit }, 1);
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { deletingItem: true }],
        [types.default.DELETE_CANNED, 1],
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { deletingItem: false }],
      ]);
    });

    it('sends correct actions if API is error', async () => {
      axios.delete.mockRejectedValue({ message: 'Error deleting' });
      await expect(actions.deleteCannedResponse({ commit }, 1)).rejects.toThrow('Error deleting');
      expect(commit.mock.calls).toEqual([
        [types.default.SET_CANNED_ERROR, null],
        [types.default.SET_CANNED_UI_FLAG, { deletingItem: true }],
        [types.default.SET_CANNED_ERROR, 'Error deleting'],
        [types.default.SET_CANNED_UI_FLAG, { deletingItem: false }],
      ]);
    });
  });
});
