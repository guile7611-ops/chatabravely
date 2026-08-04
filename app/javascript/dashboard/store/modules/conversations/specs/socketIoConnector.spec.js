import { describe, it, expect, vi, beforeEach } from 'vitest';
import SocketIoConnector from 'dashboard/helper/socketIoConnector';

const mockDispatch = vi.fn();
const mockApp = {
  $store: {
    dispatch: mockDispatch,
  },
};

describe('SocketIoConnector', () => {
  let connector;

  beforeEach(() => {
    mockDispatch.mockClear();
    connector = new SocketIoConnector(mockApp);
  });

  it('handles conversation.created event by dispatching addConversation with UI format', () => {
    const payload = {
      id: 10,
      inboxId: 1,
      assignedAgentId: null, // Recepção
      contact: { id: 5, name: 'Maria' },
    };

    connector.handleEvent('conversation.created', payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      'addConversation',
      expect.objectContaining({
        id: 10,
        inbox_id: 1,
        assignee_id: null,
      })
    );
  });

  it('handles conversation.updated event by dispatching updateConversation', () => {
    const payload = {
      id: 10,
      status: 'resolved',
    };

    connector.handleEvent('conversation.updated', payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      'updateConversation',
      expect.objectContaining({
        id: 10,
        status: 'resolved',
      })
    );
  });

  it('handles message.created event by dispatching addMessage and updateConversationLastActivity', () => {
    const payload = {
      id: 99,
      conversationId: 10,
      content: 'Mensagem de teste',
      direction: 'inbound',
      createdAt: '2026-08-04T00:00:00.000Z',
    };

    connector.handleEvent('message.created', payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      'addMessage',
      expect.objectContaining({
        id: 99,
        conversation_id: 10,
        content: 'Mensagem de teste',
      })
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      'updateConversationLastActivity',
      expect.objectContaining({
        conversationId: 10,
      })
    );
  });

  it('handles conversation.assigned event by dispatching updateConversation with agent', () => {
    const payload = {
      id: 10,
      assignedAgentId: 5,
      assignee: { id: 5, name: 'Atendente 1' },
    };

    connector.handleEvent('conversation.assigned', payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      'updateConversation',
      expect.objectContaining({
        id: 10,
        assignee_id: 5,
      })
    );
  });
});
