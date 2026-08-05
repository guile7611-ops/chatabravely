import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { initSocket } from './socket/socket';
import accountRoutes from './routes/account.routes';
import webhookRoutes from './routes/webhook.routes';
import channelRoutes from './routes/channel.routes';
import conversationRoutes from './routes/conversation.routes';
import helpRoutes from './routes/help.routes';
import userRoutes from './routes/user.routes';
import departmentRoutes from './routes/department.routes';
import attendantRoutes from './routes/attendant.routes';
import labelRoutes from './routes/label.routes';
import contactRoutes from './routes/contact.routes';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('❌ [FATAL] Variável de ambiente JWT_SECRET não definida em ambiente de produção!');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Criar servidor HTTP para integracao com Socket.io
const server = http.createServer(app);

// Inicializar Servidor de WebSockets (Socket.io)
initSocket(server);

// Registrar Rotas do Sistema (Account API para Chatwoot, Webhooks, Canais, Conversas, etc.)
app.use('/api/v1/accounts/:accountId', accountRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/help', helpRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/attendants', attendantRoutes);
app.use('/api/v1/labels', labelRoutes);
app.use('/api/v1/contacts', contactRoutes);

// Rota de Health Check e Verificacao da Infraestrutura (PostgreSQL + Express + Socket.io)
app.get('/api/v1/health', async (req: Request, res: Response) => {
  try {
    const workspaceCount = await prisma.workspace.count();
    const channelCount = await prisma.channel.count();
    const conversationCount = await prisma.conversation.count();

    return res.status(200).json({
      status: 'OK',
      system: 'Abravely Chat Commercial SaaS Backend (newabra)',
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
  } catch (error: any) {
    return res.status(500).json({
      status: 'ERROR',
      system: 'Abravely Chat Backend (newabra)',
      message: 'Falha na conexão com o banco de dados PostgreSQL',
      error: error.message
    });
  }
});

// Endpoint base das APIs
app.get('/api/v1', (req: Request, res: Response) => {
  return res.json({
    name: 'Abravely Chat API (newabra)',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Backend Abravely Chat (newabra) (REST + WebSockets) rodando na porta ${PORT}`);
  console.log(`📡 Health check disponível em: http://localhost:${PORT}/api/v1/health`);
});
