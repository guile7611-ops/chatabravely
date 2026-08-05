import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions } from '../../inboxes';
import * as types from '../../../mutation-types';
import InboxesAPI from '../../../../api/inboxes';

vi.mock('../../../../api/inboxes');

const commit = vi.fn();

describe('inboxes/actions (Meta Oficial e Evolution Go)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carrega somente os canais reais devolvidos pela API', async () => {
    InboxesAPI.get.mockResolvedValue({ data: { channels: [{ id: 'meta-1', name: 'WhatsApp Oficial', type: 'META_CLOUD', connectionStatus: 'CONNECTED', metaPhoneNumberId: '123' }] } });
    await actions.get({ commit });
    expect(commit).toHaveBeenCalledWith(types.default.SET_INBOXES, [expect.objectContaining({ id: 'meta-1', provider: 'META_CLOUD', medium: 'meta', connection_status: 'CONNECTED' })]);
    expect(commit).toHaveBeenLastCalledWith(types.default.SET_INBOXES_UI_FLAG, { isFetching: false });
  });

  it('preserva a lista e propaga a falha ao carregar', async () => {
    const error = { response: { data: { message: 'Banco indisponível' } } };
    InboxesAPI.get.mockRejectedValue(error);
    await expect(actions.get({ commit })).rejects.toBe(error);
    expect(commit).toHaveBeenCalledWith('SET_INBOX_ERROR', 'Banco indisponível');
    expect(commit).not.toHaveBeenCalledWith(types.default.SET_INBOXES, expect.anything());
  });

  it('cria uma conexão Meta Oficial confirmada pelo backend', async () => {
    InboxesAPI.createMetaChannel.mockResolvedValue({ data: { channel: { id: 'meta-2', name: 'Comercial', type: 'META_CLOUD', connectionStatus: 'CONNECTED' } } });
    const result = await actions.createMetaChannel({ commit }, { name: 'Comercial', metaPhoneNumberId: '123', metaToken: 'token' });
    expect(result.provider).toBe('META_CLOUD');
    expect(commit).toHaveBeenCalledWith(types.default.ADD_INBOXES, expect.objectContaining({ id: 'meta-2', connection_status: 'CONNECTED' }));
  });

  it('cria uma conexão Evolution Go confirmada pelo backend', async () => {
    InboxesAPI.createEvolutionChannel.mockResolvedValue({ data: { channelId: 'evo-1', instanceName: 'vendas', connectionStatus: 'CONNECTING', qrCodeBase64: 'base64' } });
    const result = await actions.createEvolutionChannel({ commit }, { name: 'Vendas' });
    expect(result.channel.provider).toBe('EVOLUTION');
    expect(commit).toHaveBeenCalledWith(types.default.ADD_INBOXES, expect.objectContaining({ id: 'evo-1', connection_status: 'CONNECTING' }));
  });

  it('não cria canal local quando a API rejeita a conexão', async () => {
    const error = { response: { data: { message: 'Credenciais inválidas' } } };
    InboxesAPI.createMetaChannel.mockRejectedValue(error);
    await expect(actions.createMetaChannel({ commit }, { name: 'Inválido' })).rejects.toBe(error);
    expect(commit).toHaveBeenCalledWith('SET_INBOX_ERROR', 'Credenciais inválidas');
    expect(commit).not.toHaveBeenCalledWith(types.default.ADD_INBOXES, expect.anything());
  });

  it('remove o canal local somente após confirmação do backend', async () => {
    InboxesAPI.delete.mockResolvedValue({ data: { success: true } });
    await actions.delete({ commit }, 'meta-1');
    expect(commit).toHaveBeenCalledWith(types.default.DELETE_INBOXES, 'meta-1');
  });

  it('mantém o canal local quando a exclusão falha', async () => {
    const error = { response: { data: { message: 'Falha ao excluir' } } };
    InboxesAPI.delete.mockRejectedValue(error);
    await expect(actions.delete({ commit }, 'meta-1')).rejects.toBe(error);
    expect(commit).not.toHaveBeenCalledWith(types.default.DELETE_INBOXES, 'meta-1');
  });

  it('sincroniza templates aprovados no canal Meta correto', async () => {
    const currentState = { records: [{ id: 'meta-1', message_templates: [] }, { id: 'evo-1' }] };
    const templates = [{ name: 'boas_vindas', status: 'APPROVED' }];
    InboxesAPI.getApprovedTemplates.mockResolvedValue({ data: { templates } });
    await actions.syncTemplates({ commit, state: currentState }, 'meta-1');
    expect(commit).toHaveBeenCalledWith(types.default.SET_INBOXES, [{ id: 'meta-1', message_templates: templates }, { id: 'evo-1' }]);
  });
});
