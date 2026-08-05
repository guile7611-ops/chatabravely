import { describe, expect, it } from 'vitest';
import { getters } from '../../inboxes';

const records = [
  { id: 'meta-1', name: 'WhatsApp Oficial', provider: 'META_CLOUD', connection_status: 'CONNECTED', message_templates: [
    { name: 'boas_vindas', status: 'APPROVED', components: [] },
    { name: 'login', status: 'APPROVED', category: 'AUTHENTICATION', components: [] },
    { name: 'rejeitado', status: 'REJECTED', components: [] },
  ] },
  { id: 'evo-1', name: 'WhatsApp Vendas', provider: 'EVOLUTION', connection_status: 'DISCONNECTED' },
];
const sampleState = { records, error: 'Falha real', uiFlags: { isFetching: false } };

describe('inboxes/getters (Meta Oficial e Evolution Go)', () => {
  it('expõe lista, erro e flags', () => {
    expect(getters.getInboxes(sampleState)).toBe(records);
    expect(getters.getInboxesError(sampleState)).toBe('Falha real');
    expect(getters.getUIFlags(sampleState)).toEqual({ isFetching: false });
  });
  it('busca canal por UUID sem coerção numérica', () => {
    expect(getters.getInbox(sampleState)('meta-1')).toBe(records[0]);
    expect(getters.getInboxById(sampleState)('evo-1').name).toBe('WhatsApp Vendas');
  });
  it('libera nova conversa somente em canal conectado', () => {
    expect(getters.getNewConversationInboxes(sampleState)).toEqual([records[0]]);
  });
  it('expõe somente templates Meta aprovados e compatíveis', () => {
    const localGetters = { getWhatsAppTemplates: getters.getWhatsAppTemplates(sampleState) };
    expect(getters.getFilteredWhatsAppTemplates(sampleState, localGetters)('meta-1')).toEqual([records[0].message_templates[0]]);
  });
  it('não anuncia integrações legadas como Dialogflow', () => {
    expect(getters.dialogFlowEnabledInboxes(sampleState)).toEqual([]);
  });
});
