import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import createServer from 'http';
import { io as ClientSocket } from 'socket.io-client';
import { setAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

// Mock do prisma para simular banco de dados isolado no backend real
const mockDbUser = {
  id: 'user-uuid-999',
  email: 'agente@abravely.com',
  name: 'Agente Real Abravely',
  role: 'administrator',
  workspaceId: 'workspace-real-123',
};

vi.mock('../../../../../../../backend/src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }) => {
        if (where?.id === 'user-uuid-999') {
          return mockDbUser;
        }
        return null;
      }),
    },
  },
}));

// Importacao direta do modulo real backend de socket e middleware de auth
import { initSocket, getIO } from '../../../../../../../backend/src/socket/socket';
import { generateUserToken, getJwtSecret } from '../../../../../../../backend/src/middlewares/auth.middleware';

let httpServer;
let port;

describe('Socket.io Real Backend Code Integration Test (initSocket & JWT Verification)', () => {
  beforeAll(async () => {
    clearAbravelyJwtToken();

    httpServer = createServer.createServer();
    // Executa a funcao real initSocket do backend Abravely em backend/src/socket/socket.ts
    initSocket(httpServer);

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    clearAbravelyJwtToken();
    const ioInstance = getIO();
    if (ioInstance) {
      ioInstance.close();
    }
    if (httpServer) {
      httpServer.close();
    }
  });

  it('connects via real initSocket, authenticates with jwt.verify, queries Prisma DB, and joins workspace room', async () => {
    // Gerar JWT real assinado pelo backend oficial generateUserToken
    const validJwt = generateUserToken({
      id: 'user-uuid-999',
      email: 'agente@abravely.com',
      name: 'Agente Real Abravely',
      role: 'administrator',
      workspaceId: 'workspace-real-123',
    });
    setAbravelyJwtToken(validJwt);

    const clientSocket = ClientSocket(`http://localhost:${port}`, {
      path: '/socket.io',
      auth: { token: validJwt },
      reconnection: false,
      timeout: 3000,
    });

    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout ao conectar no servidor real')), 3000);
      clientSocket.on('connect', () => {
        clearTimeout(timer);
        resolve('connected');
      });
      clientSocket.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    expect(result).toBe('connected');

    // Validar se o servidor backend real populou socket.data.user e ingressou na sala workspace_workspace-real-123
    const ioInstance = getIO();
    const serverSockets = Array.from(ioInstance.sockets.sockets.values());
    const connectedServerSocket = serverSockets.find((s) => s.data?.user?.id === 'user-uuid-999');

    expect(connectedServerSocket).toBeDefined();
    expect(connectedServerSocket.data.user).toEqual({
      id: 'user-uuid-999',
      email: 'agente@abravely.com',
      name: 'Agente Real Abravely',
      role: 'administrator',
      workspaceId: 'workspace-real-123',
    });
    expect(connectedServerSocket.rooms.has('workspace_workspace-real-123')).toBe(true);

    clientSocket.disconnect();
  });

  it('rejects connection strictly with connect_error when invalid token is provided to real initSocket', async () => {
    const invalidToken = 'invalid-fake-token';
    const clientSocket = ClientSocket(`http://localhost:${port}`, {
      path: '/socket.io',
      auth: { token: invalidToken },
      reconnection: false,
      timeout: 3000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect_error', (err) => resolve(`connect_error: ${err.message}`));
      clientSocket.on('connect', () => resolve('connected'));
    });

    clientSocket.disconnect();
    expect(result).toContain('connect_error');
  });

  it('rejects connection strictly with connect_error when Rails Devise session token is sent', async () => {
    const railsToken = 'cw_d_session_info_rails_devise_header_xyz';
    const clientSocket = ClientSocket(`http://localhost:${port}`, {
      path: '/socket.io',
      auth: { token: railsToken },
      reconnection: false,
      timeout: 3000,
    });

    const result = await new Promise((resolve) => {
      clientSocket.on('connect_error', (err) => resolve(`connect_error: ${err.message}`));
      clientSocket.on('connect', () => resolve('connected'));
    });

    clientSocket.disconnect();
    expect(result).toContain('connect_error');
  });
});
