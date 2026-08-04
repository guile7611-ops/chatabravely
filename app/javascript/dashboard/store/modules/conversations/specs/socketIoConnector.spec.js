import { describe, it, expect, vi, beforeEach } from 'vitest';
import SocketIoConnector, { getSocketUrl } from 'dashboard/helper/socketIoConnector';
import { setAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';
import { io } from 'socket.io-client';

const eventHandlers = {};

vi.mock('socket.io-client', () => ({
  io: vi.fn((url, options) => ({
    connected: true,
    url,
    options,
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

describe('SocketIoConnector Real Authenticated Integration', () => {
  let connector;
  const validJwt = 'header.payload.signature';

  beforeEach(() => {
    mockDispatch.mockClear();
    mockCommit.mockClear();
    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);
    clearAbravelyJwtToken();
    connector = new SocketIoConnector(mockApp);
  });

  it('refuses connection if no valid Abravely JWT is present', () => {
    connector.connect();
    expect(connector.isConnected).toBe(false);
    expect(mockCommit).toHaveBeenCalledWith(
      'SET_CONVERSATIONS_ERROR',
      expect.stringContaining('JWT Abravely não localizado')
    );
    expect(io).not.toHaveBeenCalled();
  });

  it('connects and passes token in handshake auth when valid Abravely JWT exists', () => {
    setAbravelyJwtToken(validJwt);
    connector.connect();

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: {
          token: validJwt,
        },
      })
    );
  });

  it('resolves socket URL properly without silent fallback', () => {
    const resolvedUrl = getSocketUrl();
    expect(resolvedUrl).toBe(window.location.origin);
  });

  it('connects directly to the Express backend when served by Vite in development', () => {
    expect(
      getSocketUrl({
        origin: 'http://localhost:5173',
        port: '5173',
      })
    ).toBe('http://localhost:3000');
  });

  it('handles connect_error by committing SET_CONVERSATIONS_ERROR mutation', () => {
    setAbravelyJwtToken(validJwt);
    connector.connect();

    eventHandlers['connect_error']({ message: 'Autenticação WebSocket falhou' });
    expect(mockCommit).toHaveBeenCalledWith(
      'SET_CONVERSATIONS_ERROR',
      'Autenticação WebSocket falhou'
    );
  });

  it('handles reconnect by resetting SET_CONVERSATIONS_ERROR mutation', () => {
    setAbravelyJwtToken(validJwt);
    connector.connect();

    eventHandlers['reconnect']();
    expect(mockCommit).toHaveBeenCalledWith('SET_CONVERSATIONS_ERROR', null);
  });

  it('deduplicates duplicate canonical and alias events', () => {
    setAbravelyJwtToken(validJwt);
    connector.connect();

    const payload = {
      id: 99,
      conversationId: 'uuid-conversa-123',
      content: 'Mensagem via socket',
      direction: 'inbound',
      createdAt: '2026-08-04T00:00:00.000Z',
    };

    // First call with canonical event message.created
    eventHandlers['message.created'](payload);
    expect(mockDispatch).toHaveBeenCalledTimes(2); // addMessage + updateConversationLastActivity

    mockDispatch.mockClear();

    // Duplicate call with legacy alias event message:new
    eventHandlers['message:new'](payload);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handles conversation.assigned by dispatching updateConversation', () => {
    setAbravelyJwtToken(validJwt);
    connector.connect();

    const payload = {
      id: 'uuid-conversa-123',
      assignedAgentId: 5,
      assignee: { id: 5, name: 'Atendente 1' },
    };

    eventHandlers['conversation.assigned'](payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      'updateConversation',
      expect.objectContaining({
        id: 'uuid-conversa-123',
        assignee_id: 5,
      })
    );
  });

  it('cleans up handlers on disconnect', () => {
    setAbravelyJwtToken(validJwt);
    connector.connect();

    connector.disconnect();
    expect(connector.socket).toBeNull();
    expect(connector.isConnected).toBe(false);
    expect(Object.keys(eventHandlers).length).toBe(0);
  });
});
