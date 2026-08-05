import { describe, expect, it } from 'vitest';
import {
  normalizeRealtimeConversation,
  normalizeRealtimeMessage,
} from '../abravelyConversationAdapter';

describe('abravelyConversationAdapter', () => {
  it('normalizes a backend message event without legacy message types', () => {
    const message = normalizeRealtimeMessage({
      message: {
        id: 'message-1',
        conversationId: 'conversation-1',
        content: 'Olá',
        createdAt: '2026-08-05T12:00:00.000Z',
      },
    });

    expect(message).toMatchObject({
      id: 'message-1',
      conversationId: 'conversation-1',
      conversation_id: 'conversation-1',
      content: 'Olá',
    });
    expect(message.created_at).toBeTypeOf('number');
  });

  it('preserves the native queue, contact and messages of a conversation event', () => {
    const conversation = normalizeRealtimeConversation({
      conversation: {
        id: 'conversation-1',
        queue: 'DEPARTMENT',
        meta: { sender: { id: 'contact-1', name: 'Ana' } },
        messages: [{ id: 'message-1', conversationId: 'conversation-1' }],
      },
    });

    expect(conversation).toMatchObject({
      id: 'conversation-1',
      queue: 'DEPARTMENT',
      contact: { id: 'contact-1', name: 'Ana' },
    });
    expect(conversation.messages[0].conversation_id).toBe('conversation-1');
  });
});
