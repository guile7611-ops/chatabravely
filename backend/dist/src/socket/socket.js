"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
exports.emitToWorkspace = emitToWorkspace;
exports.emitToConversation = emitToConversation;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const prisma_1 = require("../lib/prisma");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
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
            const decoded = jsonwebtoken_1.default.verify(token, (0, auth_middleware_1.getJwtSecret)());
            // Validação estrita do usuário no Banco de Dados
            let dbUser = null;
            try {
                dbUser = await prisma_1.prisma.user.findUnique({
                    where: { id: decoded.id },
                    select: { id: true, email: true, name: true, role: true, workspaceId: true }
                });
            }
            catch (dbErr) {
                console.warn('⚠️ [Socket.io] Banco inacessível. Extraindo contexto do token JWT assinado.');
                dbUser = {
                    id: decoded.id || 'user-dev-1',
                    email: decoded.email || 'agente@abravely.com',
                    name: decoded.name || 'Agente Abravely',
                    role: decoded.role || 'ADMIN',
                    workspaceId: decoded.workspaceId || 'workspace-dev-1'
                };
            }
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
        }
        catch (err) {
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
        socket.on('join_conversation', (conversationId) => {
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
function getIO() {
    return io;
}
function emitToWorkspace(workspaceId, event, data) {
    if (io) {
        io.to(`workspace_${workspaceId}`).emit(event, data);
    }
}
function emitToConversation(conversationId, event, data) {
    if (io) {
        io.to(`conversation_${conversationId}`).emit(event, data);
    }
}
