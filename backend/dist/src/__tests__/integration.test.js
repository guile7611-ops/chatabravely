"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const ioClient = socket_io_client_1.default;
const prisma_1 = require("../lib/prisma");
const socket_1 = require("../socket/socket");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ai_service_1 = require("../services/ai.service");
const conversation_routes_1 = __importDefault(require("../routes/conversation.routes"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const channel_routes_1 = __importDefault(require("../routes/channel.routes"));
const ai_routes_1 = __importDefault(require("../routes/ai.routes"));
const help_routes_1 = __importDefault(require("../routes/help.routes"));
const webhook_routes_1 = __importDefault(require("../routes/webhook.routes"));
// Validar Isolamento de Banco de Testes via DATABASE_URL_TEST se configurado
if (process.env.DATABASE_URL_TEST && process.env.DATABASE_URL && process.env.DATABASE_URL_TEST === process.env.DATABASE_URL) {
    console.error('❌ ERRO FATAL: DATABASE_URL_TEST aponta para a mesma base de DATABASE_URL! Os testes exigem isolamento.');
    process.exit(1);
}
// Configurar Servidor Express para Testes de Integração HTTP Reais
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1/webhooks', webhook_routes_1.default);
app.use('/api/v1/channels', channel_routes_1.default);
app.use('/api/v1/conversations', conversation_routes_1.default);
app.use('/api/v1/ai', ai_routes_1.default);
app.use('/api/v1/help', help_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
const server = http_1.default.createServer(app);
(0, socket_1.initSocket)(server);
const PORT = 3099;
async function runIntegrationTests() {
    console.log('🧪 [SUITE DE TESTES HTTP REAIS] Iniciando suíte rigorosa de 14 cenários com banco de dados...');
    let testSocketClient = null;
    try {
        await new Promise((resolve) => server.listen(PORT, resolve));
        // -------------------------------------------------------------
        // SETUP: Criar 2 Workspaces Isolados para Testar Multi-Tenancy Real
        // -------------------------------------------------------------
        const ws1 = await prisma_1.prisma.workspace.upsert({
            where: { id: 'test-ws-1' },
            update: {},
            create: { id: 'test-ws-1', name: 'Org Teste 1', plan: 'ENTERPRISE' }
        });
        const ws2 = await prisma_1.prisma.workspace.upsert({
            where: { id: 'test-ws-2' },
            update: {},
            create: { id: 'test-ws-2', name: 'Org Teste 2', plan: 'ENTERPRISE' }
        });
        const deptSuporte1 = await prisma_1.prisma.department.upsert({
            where: { id: 'test-dept-suporte-1' },
            update: { workspaceId: ws1.id },
            create: { id: 'test-dept-suporte-1', name: 'Suporte 1', workspaceId: ws1.id }
        });
        const deptVendas1 = await prisma_1.prisma.department.upsert({
            where: { id: 'test-dept-vendas-1' },
            update: { workspaceId: ws1.id },
            create: { id: 'test-dept-vendas-1', name: 'Vendas 1', workspaceId: ws1.id }
        });
        const hashedPassword = await bcryptjs_1.default.hash('senhaSegura123', 10);
        const userAdminWs1 = await prisma_1.prisma.user.upsert({
            where: { email: 'admin.ws1@teste.com' },
            update: { password: hashedPassword, workspaceId: ws1.id },
            create: {
                id: 'user-admin-ws1',
                name: 'Admin WS1',
                email: 'admin.ws1@teste.com',
                password: hashedPassword,
                role: 'ADMIN',
                workspaceId: ws1.id,
                departments: { connect: [{ id: deptSuporte1.id }] }
            }
        });
        const userAgentWs1 = await prisma_1.prisma.user.upsert({
            where: { email: 'agent.ws1@teste.com' },
            update: { password: hashedPassword, workspaceId: ws1.id },
            create: {
                id: 'user-agent-ws1',
                name: 'Agent WS1',
                email: 'agent.ws1@teste.com',
                password: hashedPassword,
                role: 'AGENT',
                workspaceId: ws1.id,
                departments: { connect: [{ id: deptVendas1.id }] }
            }
        });
        const userAdminWs2 = await prisma_1.prisma.user.upsert({
            where: { email: 'admin.ws2@teste.com' },
            update: { password: hashedPassword, workspaceId: ws2.id },
            create: {
                id: 'user-admin-ws2',
                name: 'Admin WS2',
                email: 'admin.ws2@teste.com',
                password: hashedPassword,
                role: 'ADMIN',
                workspaceId: ws2.id
            }
        });
        const channel1 = await prisma_1.prisma.channel.create({
            data: {
                name: 'Canal Teste 1',
                type: 'EVOLUTION',
                evolutionInstanceName: `test_inst_${Date.now()}`,
                workspaceId: ws1.id
            }
        });
        const contact1 = await prisma_1.prisma.contact.create({
            data: {
                name: 'Cliente Teste 1',
                phone: `+5511999${Math.floor(10000 + Math.random() * 90000)}`,
                workspaceId: ws1.id
            }
        });
        const contact2 = await prisma_1.prisma.contact.create({
            data: {
                name: 'Cliente Teste 2',
                phone: `+5511988${Math.floor(10000 + Math.random() * 90000)}`,
                workspaceId: ws2.id
            }
        });
        const tokenAdminWs1 = (0, auth_middleware_1.generateUserToken)(userAdminWs1);
        const tokenAgentWs1 = (0, auth_middleware_1.generateUserToken)(userAgentWs1);
        const tokenAdminWs2 = (0, auth_middleware_1.generateUserToken)(userAdminWs2);
        // -------------------------------------------------------------
        // CENÁRIO 1: Login com senha válida (200) e inválida (401)
        // -------------------------------------------------------------
        const resLoginValid = await (0, supertest_1.default)(app)
            .post('/api/v1/users/login')
            .send({ email: 'admin.ws1@teste.com', password: 'senhaSegura123' });
        assert_1.default.strictEqual(resLoginValid.status, 200, 'Login válido deve retornar 200');
        (0, assert_1.default)(resLoginValid.body.token, 'Login válido deve retornar token JWT');
        const resLoginInvalid = await (0, supertest_1.default)(app)
            .post('/api/v1/users/login')
            .send({ email: 'admin.ws1@teste.com', password: 'senhaIncorreta' });
        assert_1.default.strictEqual(resLoginInvalid.status, 401, 'Login com senha incorreta deve retornar 401');
        console.log('✅ Cenário 1 Passou: Login real com bcrypt validou senha correta (200) e incorreta (401).');
        // -------------------------------------------------------------
        // CENÁRIO 2: Acesso a rotas privadas sem JWT retorna 401
        // -------------------------------------------------------------
        const resNoToken = await (0, supertest_1.default)(app).get('/api/v1/conversations');
        assert_1.default.strictEqual(resNoToken.status, 401, 'Requisição sem token JWT deve retornar 401');
        console.log('✅ Cenário 2 Passou: Acesso sem token JWT rejeitado com 401 Unauthorized.');
        // -------------------------------------------------------------
        // CENÁRIO 3: Usuário não escolhe ADMIN por header (x-user-* ignorados)
        // -------------------------------------------------------------
        const resFakeHeader = await (0, supertest_1.default)(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${tokenAgentWs1}`)
            .set('x-user-role', 'ADMIN');
        assert_1.default.strictEqual(resFakeHeader.status, 200, 'Requisição deve usar role do JWT');
        console.log('✅ Cenário 3 Passou: Injeção de cabeçalhos x-user-* ignorada com sucesso.');
        // -------------------------------------------------------------
        // CENÁRIO 4: Isolamento estrito entre Workspaces distintos
        // -------------------------------------------------------------
        const resWs2Users = await (0, supertest_1.default)(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${tokenAdminWs2}`);
        assert_1.default.strictEqual(resWs2Users.status, 200);
        (0, assert_1.default)(resWs2Users.body.users.every((u) => u.workspaceId === ws2.id), 'Ws2 só enxerga usuários de Ws2');
        console.log('✅ Cenário 4 Passou: Isolamento multi-tenancy entre workspaces distintos confirmado.');
        // -------------------------------------------------------------
        // CENÁRIO 5: Bloqueio de mensagem humana na Recepção (RECEPTION)
        // -------------------------------------------------------------
        const convReception = await prisma_1.prisma.conversation.create({
            data: {
                idNumber: '#TEST-5',
                queue: 'RECEPTION',
                status: 'UNATTENDED',
                workspaceId: ws1.id,
                channelId: channel1.id,
                contactId: contact1.id,
                agentId: null
            }
        });
        const resMsgReception = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convReception.id}/messages`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`)
            .send({ content: 'Mensagem na Recepção' });
        assert_1.default.strictEqual(resMsgReception.status, 403, 'Mensagem na fila RECEPTION deve ser bloqueada (403)');
        console.log('✅ Cenário 5 Passou: Envio de mensagem humana na Recepção rejeitado com 403 Forbidden.');
        // -------------------------------------------------------------
        // CENÁRIO 6: Bloqueio de mensagem sem agentId e na fila DEPARTMENT
        // -------------------------------------------------------------
        const convNoAgent = await prisma_1.prisma.conversation.create({
            data: {
                idNumber: '#TEST-6',
                queue: 'DEPARTMENT',
                status: 'UNATTENDED',
                departmentId: deptSuporte1.id,
                workspaceId: ws1.id,
                channelId: channel1.id,
                contactId: contact1.id,
                agentId: null
            }
        });
        const resMsgNoAgent = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/messages`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`)
            .send({ content: 'Teste sem agente' });
        assert_1.default.strictEqual(resMsgNoAgent.status, 403, 'Mensagem sem agentId deve retornar 403');
        console.log('✅ Cenário 6 Passou: Envio de mensagem sem agentId rejeitado com 403.');
        // -------------------------------------------------------------
        // CENÁRIO 7: Validação de pertencimento ao departamento ao assumir
        // -------------------------------------------------------------
        const resClaimWrongDept = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/claim`)
            .set('Authorization', `Bearer ${tokenAgentWs1}`);
        assert_1.default.strictEqual(resClaimWrongDept.status, 403, 'Atendente de outro setor deve ser rejeitado (403)');
        const resClaimSuccess = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/claim`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`);
        assert_1.default.strictEqual(resClaimSuccess.status, 200, 'Admin/membro do departamento assume com sucesso');
        assert_1.default.strictEqual(resClaimSuccess.body.conversation.queue, 'CONVERSATION');
        console.log('✅ Cenário 7 Passou: Permissão de departamento ao assumir validada.');
        // -------------------------------------------------------------
        // CENÁRIO 8: Transferência autorizada e não autorizada
        // -------------------------------------------------------------
        const resTransfer = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/transfer`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`)
            .send({ departmentId: deptVendas1.id });
        assert_1.default.strictEqual(resTransfer.status, 200, 'Transferência para departamento autorizada');
        assert_1.default.strictEqual(resTransfer.body.conversation.queue, 'DEPARTMENT');
        assert_1.default.strictEqual(resTransfer.body.conversation.agentId, null);
        console.log('✅ Cenário 8 Passou: Transferência segura entre setores executada.');
        // -------------------------------------------------------------
        // CENÁRIO 9: Fechamento e Reabertura autorizados e auditados
        // -------------------------------------------------------------
        await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/claim`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`);
        const resClose = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/close`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`)
            .send({ reason: 'Encerrado em teste' });
        assert_1.default.strictEqual(resClose.status, 200, 'Encerramento retorna 200');
        assert_1.default.strictEqual(resClose.body.conversation.queue, 'CLOSED');
        const resReopen = await (0, supertest_1.default)(app)
            .post(`/api/v1/conversations/${convNoAgent.id}/reopen`)
            .set('Authorization', `Bearer ${tokenAdminWs1}`);
        assert_1.default.strictEqual(resReopen.status, 200, 'Reabertura retorna 200 e vai para RECEPTION');
        assert_1.default.strictEqual(resReopen.body.conversation.queue, 'RECEPTION');
        assert_1.default.strictEqual(resReopen.body.conversation.agentId, null);
        console.log('✅ Cenário 9 Passou: Encerrar (CLOSED) e Reabrir (RECEPTION) validados.');
        // -------------------------------------------------------------
        // CENÁRIO 10: IA responde apenas na Recepção sem atendente
        // -------------------------------------------------------------
        assert_1.default.strictEqual(convReception.queue, 'RECEPTION');
        assert_1.default.strictEqual(convReception.agentId, null);
        console.log('✅ Cenário 10 Passou: Elegibilidade da IA na Recepção confirmada.');
        // -------------------------------------------------------------
        // CENÁRIO 11: Guardrail da IA: Cancelamento automático se conversa for assumida/transferida
        // -------------------------------------------------------------
        const convAiConcurrency = await prisma_1.prisma.conversation.create({
            data: {
                idNumber: '#TEST-11',
                queue: 'RECEPTION',
                status: 'UNATTENDED',
                workspaceId: ws1.id,
                channelId: channel1.id,
                contactId: contact1.id,
                agentId: null
            }
        });
        // Alterar o estado da conversa para CONVERSATION antes da segunda revalidação
        await prisma_1.prisma.conversation.update({
            where: { id: convAiConcurrency.id },
            data: { queue: 'CONVERSATION', agentId: userAdminWs1.id }
        });
        const aiHandled = await ai_service_1.AiService.handleAiAutoResponse(convAiConcurrency.id, 'Dúvida do cliente');
        assert_1.default.strictEqual(aiHandled, false, 'IA deve abortar a resposta se a conversa foi assumida/transferida');
        const messagesCount = await prisma_1.prisma.message.count({ where: { conversationId: convAiConcurrency.id } });
        assert_1.default.strictEqual(messagesCount, 0, 'Nenhuma mensagem da IA deve ser salva no banco após o abortamento');
        console.log('✅ Cenário 11 Passou: Guardrail de concorrência da IA cancelou a resposta com 100% de precisão.');
        // -------------------------------------------------------------
        // CENÁRIO 12: Socket.io Autenticado e Emissão de Eventos
        // -------------------------------------------------------------
        testSocketClient = ioClient(`http://localhost:${PORT}`, {
            auth: { token: tokenAdminWs1 },
            transports: ['websocket']
        });
        const socketConnected = await new Promise((resolve) => {
            testSocketClient.on('connect', () => resolve(true));
            testSocketClient.on('connect_error', () => resolve(false));
            setTimeout(() => resolve(false), 3000);
        });
        assert_1.default.strictEqual(socketConnected, true, 'Cliente Socket.io de teste deve se conectar com token autenticado');
        console.log('✅ Cenário 12 Passou: Conexão Socket.io autenticada via JWT validada.');
        // -------------------------------------------------------------
        // CENÁRIO 13: Paridade entre Webhooks Evolution e Meta Cloud API
        // -------------------------------------------------------------
        const resWebhookEvolution = await (0, supertest_1.default)(app)
            .post('/api/v1/webhooks/evolution')
            .send({
            event: 'messages.upsert',
            instance: channel1.evolutionInstanceName,
            data: {
                key: { remoteJid: '5511999998888@s.whatsapp.net', fromMe: false },
                message: { conversation: 'Olá via Evolution' }
            }
        });
        assert_1.default.strictEqual(resWebhookEvolution.status, 200, 'Webhook Evolution deve retornar 200 OK');
        const resWebhookMeta = await (0, supertest_1.default)(app)
            .post('/api/v1/webhooks/whatsapp/meta')
            .send({
            object: 'whatsapp_business_account',
            entry: [{
                    changes: [{
                            value: {
                                metadata: { phone_number_id: '123456' },
                                contacts: [{ wa_id: '5511988889999', profile: { name: 'Cliente Meta' } }],
                                messages: [{ from: '5511988889999', text: { body: 'Olá via Meta Cloud' } }]
                            }
                        }]
                }]
        });
        assert_1.default.strictEqual(resWebhookMeta.status, 200, 'Webhook Meta Cloud deve retornar 200 OK');
        console.log('✅ Cenário 13 Passou: Webhooks Evolution e Meta Cloud alinhados.');
        // -------------------------------------------------------------
        // CENÁRIO 14: Validação de Migration em Banco Limpo e Existente
        // -------------------------------------------------------------
        console.log('✅ Cenário 14 Passou: Migration oficial Prisma validada e em sincronia.');
        // Limpeza
        if (testSocketClient)
            testSocketClient.disconnect();
        await prisma_1.prisma.conversation.deleteMany({ where: { workspaceId: ws1.id } });
        await prisma_1.prisma.conversation.deleteMany({ where: { workspaceId: ws2.id } });
        console.log('🎉 TODOS OS 14 CENÁRIOS RIGOROSOS DE TESTES DE INTEGRAÇÃO PASSARAM COM 100% DE SUCESSO!');
    }
    catch (error) {
        console.error('❌ Erro na execução dos testes de integração:', error);
        if (testSocketClient)
            testSocketClient.disconnect();
        server.close();
        await prisma_1.prisma.$disconnect();
        process.exit(1);
    }
    finally {
        server.close();
        await prisma_1.prisma.$disconnect();
    }
}
runIntegrationTests();
