import { describe, expect, it } from 'vitest';
import module from '../abravelyConversationPanel';

const createState = () => module.state();

describe('abravelyConversationPanel', () => {
  it('keeps the active queue and its server metadata when it receives a queue', () => {
    const state = createState();
    const conversations = [{ id: 'conversation-1', queue: 'RECEPTION' }];

    module.mutations.SET_ACTIVE_QUEUE(state, 'RECEPTION');
    module.mutations.SET_QUEUE(state, {
      queue: 'RECEPTION',
      conversations,
      meta: { reception_count: 1, departments_count: 0, active_count: 0 },
    });

    expect(module.getters.getActiveQueue(state)).toBe('RECEPTION');
    expect(module.getters.getQueue(state)('RECEPTION')).toEqual(conversations);
    expect(module.getters.getQueueMeta(state)('RECEPTION').reception_count).toBe(1);
  });

  it('moves a real-time conversation to its new queue without duplicating it', () => {
    const state = createState();
    module.mutations.SET_QUEUE(state, {
      queue: 'RECEPTION',
      conversations: [{ id: 'conversation-1', queue: 'RECEPTION', messages: [] }],
      meta: {},
    });

    module.mutations.UPSERT_REALTIME_CONVERSATION(state, {
      id: 'conversation-1',
      queue: 'CONVERSATION',
      assignee_id: 'agent-1',
      messages: [],
    });

    expect(module.getters.getQueue(state)('RECEPTION')).toEqual([]);
    expect(module.getters.getQueue(state)('CONVERSATION')).toEqual([
      expect.objectContaining({ id: 'conversation-1', assignee_id: 'agent-1' }),
    ]);
  });

  it('adds each real-time message once and refreshes the list preview', () => {
    const state = createState();
    module.mutations.SET_QUEUE(state, {
      queue: 'RECEPTION',
      conversations: [{ id: 'conversation-1', queue: 'RECEPTION', messages: [] }],
      meta: {},
    });

    const message = { id: 'message-1', conversation_id: 'conversation-1', content: 'Olá' };
    module.mutations.APPEND_REALTIME_MESSAGE(state, message);
    module.mutations.APPEND_REALTIME_MESSAGE(state, message);

    expect(module.getters.getQueue(state)('RECEPTION')[0].messages).toEqual([message]);
  });
});
