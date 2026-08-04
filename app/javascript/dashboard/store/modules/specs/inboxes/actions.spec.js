import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from '../../inboxes';
import * as types from '../../../mutation-types';
import WebChannel from '../../../../api/channel/webChannel';
import InboxesAPI from '../../../../api/inboxes';
import FBChannel from '../../../../api/channel/fbChannel';

const commit = vi.fn();
const dispatch = vi.fn();
vi.mock('../../../../api/inboxes');
vi.mock('../../../../api/channel/webChannel');
vi.mock('../../../../api/channel/fbChannel');

describe('inboxes/actions', () => {
  beforeEach(() => {
    commit.mockClear();
    dispatch.mockClear();
    vi.clearAllMocks();
  });

  describe('#get', () => {
    it('sends correct actions if API is success with list', async () => {
      const inboxList = [{ id: 1, name: 'Inbox 1', channel_type: 'Channel::Whatsapp' }];
      InboxesAPI.get.mockResolvedValue({ data: { payload: inboxList } });
      await actions.get({ commit });
      expect(InboxesAPI.get).toHaveBeenCalledWith();
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: true }],
        [types.default.SET_INBOXES, inboxList],
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isFetching: false }],
      ]);
    });

    it('sends correct actions if API is success with empty list', async () => {
      InboxesAPI.get.mockResolvedValue({ data: { payload: [] } });
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
      InboxesAPI.get.mockRejectedValue(apiError);
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
      InboxesAPI.get.mockResolvedValue({ data: { payload: inboxList } });
      await actions.get({ commit });
      expect(commit.mock.calls[0]).toEqual(['SET_INBOX_ERROR', null]);
      expect(commit.mock.calls[3]).toEqual(['SET_INBOX_ERROR', null]);
      expect(commit.mock.calls[4]).toEqual([
        types.default.SET_INBOXES_UI_FLAG,
        { isFetching: false },
      ]);
    });
  });

  describe('#createMetaChannel', () => {
    it('sends correct actions and adds inbox on API success', async () => {
      const payload = {
        name: 'WhatsApp Meta Test',
        phoneNumber: '+5511999999999',
        phoneNumberId: '123456',
        businessAccountId: '654321',
        apiKey: 'token123',
      };
      const createdChannel = { id: 10, name: 'WhatsApp Meta Test', channel_type: 'Channel::MetaCloud' };
      InboxesAPI.createMetaChannel.mockResolvedValue({
        data: { channel: createdChannel },
      });

      const result = await actions.createMetaChannel({ commit }, payload);

      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: true }],
        [
          types.default.ADD_INBOXES,
          {
            ...createdChannel,
            channel_id: createdChannel.id,
            channel_type: 'Channel::Whatsapp',
            provider: 'META_CLOUD',
            medium: 'meta',
            connection_status: undefined,
          },
        ],
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: false }],
      ]);
      expect(result).toEqual({
        ...createdChannel,
        channel_id: createdChannel.id,
        channel_type: 'Channel::Whatsapp',
        provider: 'META_CLOUD',
        medium: 'meta',
        connection_status: undefined,
      });
    });

    it('handles API failure, saves real error message, does NOT add local inbox to records and sets isCreating to false in finally', async () => {
      const payload = { name: 'WhatsApp Meta Fail' };
      const apiError = { response: { data: { message: 'Token Meta inválido' } } };
      InboxesAPI.createMetaChannel.mockRejectedValue(apiError);

      await expect(actions.createMetaChannel({ commit }, payload)).rejects.toEqual(apiError);

      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: true }],
        ['SET_INBOX_ERROR', 'Token Meta inválido'],
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: false }],
      ]);
    });
  });

  describe('#createChannel', () => {
    it('creates channel via WebChannel and adds inbox on success', async () => {
      const params = { name: 'Test API Channel', channel: { type: 'api' } };
      const newChannel = { id: 101, name: 'Test API Channel' };
      WebChannel.create.mockResolvedValue({ data: newChannel });

      const result = await actions.createChannel({ commit }, params);

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: true }],
        [types.default.ADD_INBOXES, newChannel],
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: false }],
      ]);
      expect(result).toEqual(newChannel);
    });

    it('handles API failure on createChannel and sets isCreating to false in finally', async () => {
      const params = { name: 'Test API Fail', channel: { type: 'api' } };
      const apiError = new Error('Falha de criação de canal');
      WebChannel.create.mockRejectedValue(apiError);

      await actions.createChannel({ commit }, params);

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: true }],
        [types.default.SET_INBOXES_UI_FLAG, { isCreating: false }],
      ]);
    });
  });

  describe('#updateInbox', () => {
    it('sends correct actions on update success and sets isUpdating to false in finally', async () => {
      const updatedInbox = { id: 1, name: 'Inbox Atualizado' };
      InboxesAPI.update.mockResolvedValue({ data: updatedInbox });

      await actions.updateInbox({ commit }, { id: 1, name: 'Inbox Atualizado', formData: false });

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isUpdating: true }],
        [types.default.EDIT_INBOXES, updatedInbox],
        [types.default.SET_INBOXES_UI_FLAG, { isUpdating: false }],
      ]);
    });

    it('handles API failure on updateInbox and sets isUpdating to false in finally', async () => {
      const apiError = new Error('Falha ao atualizar inbox');
      InboxesAPI.update.mockRejectedValue(apiError);

      await actions.updateInbox({ commit }, { id: 1, name: 'Inbox Fail', formData: false });

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isUpdating: true }],
        [types.default.SET_INBOXES_UI_FLAG, { isUpdating: false }],
      ]);
    });
  });

  describe('#updateInboxIMAP', () => {
    it('sends correct actions on update IMAP success', async () => {
      const updatedInbox = { id: 1, name: 'IMAP Inbox' };
      InboxesAPI.update.mockResolvedValue({ data: updatedInbox });

      await actions.updateInboxIMAP({ commit }, { id: 1, imap_address: 'imap.example.com' });

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: true }],
        [types.default.EDIT_INBOXES, updatedInbox],
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: false }],
      ]);
    });

    it('handles API failure on update IMAP and finishes isUpdatingIMAP as false', async () => {
      InboxesAPI.update.mockRejectedValue(new Error('IMAP Error'));

      await actions.updateInboxIMAP({ commit }, { id: 1 });

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: true }],
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingIMAP: false }],
      ]);
    });
  });

  describe('#updateInboxSMTP', () => {
    it('sends correct actions on update SMTP success', async () => {
      const updatedInbox = { id: 1, name: 'SMTP Inbox' };
      InboxesAPI.update.mockResolvedValue({ data: updatedInbox });

      await actions.updateInboxSMTP({ commit }, { id: 1, smtp_address: 'smtp.example.com' });

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: true }],
        [types.default.EDIT_INBOXES, updatedInbox],
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: false }],
      ]);
    });

    it('handles API failure on update SMTP and finishes isUpdatingSMTP as false', async () => {
      InboxesAPI.update.mockRejectedValue(new Error('SMTP Error'));

      await actions.updateInboxSMTP({ commit }, { id: 1 });

      expect(commit.mock.calls).toEqual([
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: true }],
        [types.default.SET_INBOXES_UI_FLAG, { isUpdatingSMTP: false }],
      ]);
    });
  });

  describe('#delete', () => {
    it('deletes inbox on success', async () => {
      InboxesAPI.delete.mockResolvedValue({});
      await actions.delete({ commit }, 1);
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: true }],
        [types.default.DELETE_INBOXES, 1],
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: false }],
      ]);
    });

    it('saves error on deletion failure, does NOT delete local inbox and sets isDeleting to false in finally', async () => {
      const apiError = { response: { data: { message: 'Erro ao deletar inbox' } } };
      InboxesAPI.delete.mockRejectedValue(apiError);
      await expect(actions.delete({ commit }, 1)).rejects.toEqual(apiError);
      expect(commit.mock.calls).toEqual([
        ['SET_INBOX_ERROR', null],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: true }],
        ['SET_INBOX_ERROR', 'Erro ao deletar inbox'],
        [types.default.SET_INBOXES_UI_FLAG, { isDeleting: false }],
      ]);
    });
  });

  describe('#reauthorizeFacebookPage', () => {
    it('edits inbox on reauthorization success', async () => {
      const responseData = { id: 5, name: 'FB Page' };
      FBChannel.reauthorizeFacebookPage.mockResolvedValue({ data: responseData });
      await actions.reauthorizeFacebookPage({ commit }, { omniauth_token: '123' });
      expect(commit.mock.calls).toEqual([[types.default.EDIT_INBOXES, responseData]]);
    });

    it('throws error on reauthorization failure', async () => {
      FBChannel.reauthorizeFacebookPage.mockRejectedValue(new Error('Auth failed'));
      await expect(actions.reauthorizeFacebookPage({ commit }, {})).rejects.toThrow('Auth failed');
    });
  });

  describe('#resetSecret', () => {
    it('resets secret on success and edits inbox', async () => {
      const responseData = { id: 2, hmac_token: 'new_secret' };
      InboxesAPI.resetSecret.mockResolvedValue({ data: responseData });
      const res = await actions.resetSecret({ commit }, 2);
      expect(commit.mock.calls).toEqual([[types.default.EDIT_INBOXES, responseData]]);
      expect(res).toEqual(responseData);
    });

    it('handles error on reset secret failure', async () => {
      InboxesAPI.resetSecret.mockRejectedValue(new Error('Reset error'));
      const res = await actions.resetSecret({ commit }, 2);
      expect(res).toBeNull();
    });
  });
});
