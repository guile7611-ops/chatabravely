import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

let io: SocketIOServer | null = null;

export function initSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  // Middleware de Autenticação JWT e Validação em Banco para o WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    (socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Autenticação WebSocket falhou: Token JWT não fornecido via Auth/Header.'));
      }

      const decoded: any = jwt.verify(token, getJwtSecret());

      // Validação estrita do usuário no Banco de Dados
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, workspaceId: true }
      });

      if (!dbUser) {
        return next(new Error('Autenticação WebSocket falhou: Usuário não localizado no banco de dados.'));
      }

      socket.data.user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        workspaceId: dbUser.workspaceId
      };

      next();
    } catch (err: any) {
      return next(new Error('Autenticação WebSocket falhou: Token JWT inválido ou expirado.'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🔌 [Socket.io] Cliente autenticado conectado: ${user.name} (ID: ${socket.id}, Workspace: ${user.workspaceId})`);

    // Entrar automaticamente na sala do Workspace extraído do Token JWT autenticado
    const workspaceRoom = `workspace_${user.workspaceId}`;
    socket.join(workspaceRoom);
    console.log(`🚪 [Socket.io] Cliente ${socket.id} entrou na sala do workspace: ${workspaceRoom}`);

    // Evento join_workspace não aceita workspaceId arbitrário: utiliza estritamente o workspace do token
    socket.on('join_workspace', () => {
      socket.join(workspaceRoom);
    });

    // Entrar na sala de uma conversa específica
    socket.on('join_conversation', (conversationId: string) => {
      if (conversationId && typeof conversationId === 'string') {
        const room = `conversation_${conversationId}`;
        socket.join(room);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] Cliente desconectado (${user.name}, ID: ${socket.id})`);
    });
  });

  console.log('⚡ [Socket.io] Servidor de WebSockets ativado com autenticação JWT.');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToWorkspace(workspaceId: string, event: string, data: any) {
  if (io) {
    io.to(`workspace_${workspaceId}`).emit(event, data);
  }
}

export function emitToConversation(conversationId: string, event: string, data: any) {
  if (io) {
    io.to(`conversation_${conversationId}`).emit(event, data);
  }
}
