import { describe, it, expect } from 'vitest';
import { toUIConversation, toUIMessage, DIRECTION_MAP } from '../abravelyAdapter';

describe('abravelyAdapter', () => {
  describe('toUIMessage', () => {
    it('converts Abravely contract message to UI format', () => {
      const input = {
        id: 10,
        conversationId: 5,
        content: 'Olá, preciso de ajuda',
        direction: 'inbound',
        createdAt: '2026-08-04T00:00:00.000Z',
        sender: { id: 2, name: 'Cliente' },
      };

      const result = toUIMessage(input);
      expect(result.id).toBe(10);
      expect(result.conversation_id).toBe(5);
      expect(result.content).toBe('Olá, preciso de ajuda');
      expect(result.message_type).toBe(DIRECTION_MAP.inbound);
      expect(result.sender).toEqual({ id: 2, name: 'Cliente' });
    });

    it('handles outbound direction correctly', () => {
      const input = { id: 11, direction: 'outbound' };
      const result = toUIMessage(input);
      expect(result.message_type).toBe(1);
    });

    it('returns empty object when input is falsy', () => {
      expect(toUIMessage(null)).toEqual({});
    });
  });

  describe('toUIConversation', () => {
    it('converts Abravely contract conversation to UI format', () => {
      const input = {
        id: 100,
        accountId: 1,
        inboxId: 2,
        status: 'open',
        assignedAgentId: 3,
        departmentId: 4,
        unreadCount: 2,
        lastMessageAt: '2026-08-04T00:00:00.000Z',
        contact: { id: 20, name: 'João' },
        messages: [{ id: 1, content: 'Oi' }],
      };

      const result = toUIConversation(input);
      expect(result.id).toBe(100);
      expect(result.inbox_id).toBe(2);
      expect(result.status).toBe('open');
      expect(result.assignee_id).toBe(3);
      expect(result.team_id).toBe(4);
      expect(result.unread_count).toBe(2);
      expect(result.meta.sender).toEqual({ id: 20, name: 'João' });
      expect(result.meta.assignee).toEqual({ id: 3 });
      expect(result.meta.team).toEqual({ id: 4 });
      expect(result.messages.length).toBe(1);
    });

    it('returns unassigned conversation structure for Recepção (sem atendente)', () => {
      const input = {
        id: 101,
        status: 'open',
        assignedAgentId: null,
        departmentId: null,
      };

      const result = toUIConversation(input);
      expect(result.assignee_id).toBeNull();
      expect(result.team_id).toBeNull();
      expect(result.meta.assignee).toBeNull();
    });

    it('returns empty object when input is falsy', () => {
      expect(toUIConversation(null)).toEqual({});
    });
  });
});
