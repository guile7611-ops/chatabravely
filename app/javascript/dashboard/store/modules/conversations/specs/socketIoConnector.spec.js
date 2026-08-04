import { describe, it, expect, vi, beforeEach } from 'vitest';
import SocketIoConnector from 'dashboard/helper/socketIoConnector';

const eventHandlers = {};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: true,
    on: vi.fn((event, cb) => {
      eventHandlers[event] = cb;
    }),
    off: vi.fn((event) => {
      delete eventHandlers[event];
    }),
    disconnect: vi.fn(),
  })),
}));

const mockDispatch = vi.fn();
const mockCommit = vi.fn();

const mockApp = {
  $store: {
    dispatch: mockDispatch,
    commit: mockCommit,
    getters: {
      getCurrentAccountId: 1,
      getCurrentUserID: 2,
    },
  },
};

describe('SocketIoConnector Real Integration', () => {
  let connector;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockCommit.mockClear();
    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);
    connector = new SocketIoConnector(mockApp);
    connector.connect();
  });

  it('registers connection and domain event handlers', () => {
    expect(eventHandlers['connect']).toBeDefined();
    expect(eventHandlers['disconnect']).toBeDefined();
    expect(eventHandlers['conversation.created']).toBeDefined();
    expect(eventHandlers['message.created']).toBeDefined();
    expect(eventHandlers['conversation.assigned']).toBeDefined();
  });

  it('deduplicates duplicate message.created events', () => {
    const payload = {
      id: 99,
      conversationId: 10,
      content: 'Mensagem unica',
      direction: 'inbound',
      createdAt: '2026-08-04T00:00:00.000Z',
    };

    // First call
    eventHandlers['message.created'](payload);
    expect(mockDispatch).toHaveBeenCalledTimes(2); // addMessage + updateConversationLastActivity

    mockDispatch.mockClear();

    // Duplicate call with same message id 99
    eventHandlers['message.created'](payload);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handles conversation.assigned by dispatching updateConversation', () => {
    const payload = {
      id: 10,
      assignedAgentId: 5,
      assignee: { id: 5, name: 'Atendente 1' },
    };

    eventHandlers['conversation.assigned'](payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      'updateConversation',
      expect.objectContaining({
        id: 10,
        assignee_id: 5,
      })
    );
  });

  it('cleans up handlers on disconnect', () => {
    connector.disconnect();
    expect(connector.socket).toBeNull();
    expect(connector.isConnected).toBe(false);
    expect(Object.keys(eventHandlers).length).toBe(0);
  });
});
