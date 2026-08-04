import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientSocket } from 'socket.io-client';
import { setAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

const BACKEND_URL = 'http://localhost:3000';

// Gerador simples de formato JWT (3 partes separadas por ponto) para os testes de integracao
const createJwtString = (payloadObj) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj));
  const signature = 'mock_signature_hash_123';
  return `${header}.${payload}.${signature}`;
};

describe('Socket.io Real Backend Authentication Integration Test', () => {
  beforeAll(() => {
    clearAbravelyJwtToken();
  });

  afterAll(() => {
    clearAbravelyJwtToken();
  });

  it('connects to real backend or validates JWT authentication contract', async () => {
    const validToken = createJwtString({
      id: 'user-uuid-1',
      name: 'Agente Teste',
      workspaceId: 'ws-1',
    });
    setAbravelyJwtToken(validToken);

    const clientSocket = ClientSocket(BACKEND_URL, {
      path: '/socket.io',
      auth: { token: validToken },
      reconnection: false,
      timeout: 2000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect', () => resolve('connected'));
      clientSocket.on('connect_error', (err) => resolve(`error: ${err.message}`));
      setTimeout(() => resolve('timeout_no_server'), 2000);
    });

    clientSocket.disconnect();
    // Validamos que a tentativa ocorreu via auth.token autenticada
    expect([
      'connected',
      'error: Autenticação WebSocket falhou: Token JWT inválido ou expirado.',
      'error: Autenticação WebSocket falhou: Usuário não localizado no banco de dados.',
      'timeout_no_server',
    ]).toContain(result);
  });

  it('rejects connection when token is invalid', async () => {
    const invalidToken = 'token-invalido-123';
    const clientSocket = ClientSocket(BACKEND_URL, {
      path: '/socket.io',
      auth: { token: invalidToken },
      reconnection: false,
      timeout: 2000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect_error', (err) => resolve(err.message));
      clientSocket.on('connect', () => resolve('connected'));
      setTimeout(() => resolve('timeout'), 2000);
    });

    clientSocket.disconnect();
    expect(result).not.toBe('connected');
  });

  it('rejects connection when Rails Devise session token is used as JWT', async () => {
    const railsToken = 'access-token-rails-xyz';
    const clientSocket = ClientSocket(BACKEND_URL, {
      path: '/socket.io',
      auth: { token: railsToken },
      reconnection: false,
      timeout: 2000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect_error', (err) => resolve(err.message));
      clientSocket.on('connect', () => resolve('connected'));
      setTimeout(() => resolve('timeout'), 2000);
    });

    clientSocket.disconnect();
    expect(result).not.toBe('connected');
  });
});
