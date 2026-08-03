"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./lib/prisma");
const socket_1 = require("./socket/socket");
const account_routes_1 = __importDefault(require("./routes/account.routes"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const channel_routes_1 = __importDefault(require("./routes/channel.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const help_routes_1 = __importDefault(require("./routes/help.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
dotenv_1.default.config();
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('❌ [FATAL] Variável de ambiente JWT_SECRET não definida em ambiente de produção!');
    process.exit(1);
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Criar servidor HTTP para integracao com Socket.io
const server = http_1.default.createServer(app);
// Inicializar Servidor de WebSockets (Socket.io)
(0, socket_1.initSocket)(server);
// Registrar Rotas do Sistema (Account API para Chatwoot, Webhooks, Canais, Conversas, etc.)
app.use('/api/v1/accounts/:accountId', account_routes_1.default);
app.use('/api/v1/webhooks', webhook_routes_1.default);
app.use('/api/v1/channels', channel_routes_1.default);
app.use('/api/v1/conversations', conversation_routes_1.default);
app.use('/api/v1/ai', ai_routes_1.default);
app.use('/api/v1/help', help_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/departments', department_routes_1.default);
// Rota de Health Check e Verificacao da Infraestrutura (PostgreSQL + Express + Socket.io)
app.get('/api/v1/health', async (req, res) => {
    try {
        const workspaceCount = await prisma_1.prisma.workspace.count();
        const channelCount = await prisma_1.prisma.channel.count();
        const conversationCount = await prisma_1.prisma.conversation.count();
        return res.status(200).json({
            status: 'OK',
            system: 'Abravely Chat 1.0 Commercial SaaS Backend',
            timestamp: new Date().toISOString(),
            database: {
                status: 'CONNECTED',
                provider: 'PostgreSQL 15',
                stats: {
                    workspaces: workspaceCount,
                    channels: channelCount,
                    conversations: conversationCount
                }
            },
            websocket: {
                status: 'ACTIVE',
                engine: 'Socket.io v4'
            },
            services: {
                evolutionApiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
                metaCloudApi: 'READY'
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'ERROR',
            system: 'Abravely Chat 1.0 Backend',
            message: 'Falha na conexão com o banco de dados PostgreSQL',
            error: error.message
        });
    }
});
// Endpoint base das APIs
app.get('/api/v1', (req, res) => {
    return res.json({
        name: 'Abravely Chat API',
        version: '1.0.0',
        documentation: '/api/v1/health'
    });
});
server.listen(PORT, () => {
    console.log(`🚀 Servidor Backend Abravely Chat 1.0 (REST + WebSockets) rodando na porta ${PORT}`);
    console.log(`📡 Health check disponível em: http://localhost:${PORT}/api/v1/health`);
});
