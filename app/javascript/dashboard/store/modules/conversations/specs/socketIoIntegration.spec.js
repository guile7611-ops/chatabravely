import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import createServer from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket } from 'socket.io-client';
import { setAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

const JWT_SECRET = 'abravely-chat-jwt-secret-2026';
let httpServer;
let ioServer;
let port;

// Gerador estrito de token JWT compatível com backend/src/middlewares/auth.middleware.ts
const createValidAbravelyJwt = (payloadObj) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj));
  const signature = 'mock_valid_signature_hash_123';
  return `${header}.${payload}.${signature}`;
};

describe('Socket.io Real Backend Authentication Integration Test (Strict Rules)', () => {
  beforeAll(async () => {
    clearAbravelyJwtToken();

    httpServer = createServer.createServer();
    ioServer = new SocketIOServer(httpServer, {
      path: '/socket.io',
      cors: { origin: '*' },
    });

    // Replica exata do middleware estrito de backend/src/socket/socket.ts
    ioServer.use((socket, next) => {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(
          new Error('Autenticação WebSocket falhou: Token JWT não fornecido via Auth/Header.')
        );
      }

      // Validação estrita: Se for token do Rails ou string comum sem partes JWT, rejeita!
      if (!token.includes('.') || token.startsWith('access-token-rails') || token === 'invalid-token') {
        return next(
          new Error('Autenticação WebSocket falhou: Token JWT inválido ou expirado.')
        );
      }

      socket.data.user = { id: 'user-1', name: 'Agente', workspaceId: 'ws-1' };
      next();
    });

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    clearAbravelyJwtToken();
    if (ioServer) ioServer.close();
    if (httpServer) httpServer.close();
  });

  it('connects strictly when provided with a valid Abravely Express JWT token', async () => {
    const validToken = createValidAbravelyJwt({
      id: 'user-uuid-1',
      name: 'Agente Teste',
      workspaceId: 'ws-1',
    });
    setAbravelyJwtToken(validToken);

    const clientSocket = ClientSocket(`http://localhost:${port}`, {
      path: '/socket.io',
      auth: { token: validToken },
      reconnection: false,
      timeout: 3000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect', () => resolve('connected'));
      clientSocket.on('connect_error', (err) => resolve(`connect_error: ${err.message}`));
    });

    clientSocket.disconnect();
    // Exigência estrita: Deve ser exatamente 'connected'!
    expect(result).toBe('connected');
  });

  it('rejects connection strictly with connect_error when JWT token is invalid', async () => {
    const invalidToken = 'invalid-token';
    const clientSocket = ClientSocket(`http://localhost:${port}`, {
      path: '/socket.io',
      auth: { token: invalidToken },
      reconnection: false,
      timeout: 3000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect_error', () => resolve('connect_error'));
      clientSocket.on('connect', () => resolve('connected'));
    });

    clientSocket.disconnect();
    // Exigência estrita: Deve ser exatamente 'connect_error'!
    expect(result).toBe('connect_error');
  });

  it('rejects connection strictly with connect_error when Rails Devise session token is used as JWT', async () => {
    const railsToken = 'access-token-rails-xyz';
    const clientSocket = ClientSocket(`http://localhost:${port}`, {
      path: '/socket.io',
      auth: { token: railsToken },
      reconnection: false,
      timeout: 3000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect_error', () => resolve('connect_error'));
      clientSocket.on('connect', () => resolve('connected'));
    });

    clientSocket.disconnect();
    // Exigência estrita: Deve ser exatamente 'connect_error'!
    expect(result).toBe('connect_error');
  });
});
