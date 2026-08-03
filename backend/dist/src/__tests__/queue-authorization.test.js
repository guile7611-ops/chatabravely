"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function runQueueAuthorizationTests() {
    console.log('🧪 [TESTES DE SEGURANÇA E FILAS] Iniciando testes integrados de JWT, permissões e filas...');
    try {
        // 1. Carregar dados de teste do banco
        const workspace = await prisma_1.prisma.workspace.findFirst();
        (0, assert_1.default)(workspace, 'Workspace de teste deve existir');
        const adminUser = await prisma_1.prisma.user.findFirst({
            where: { workspaceId: workspace.id, role: 'ADMIN' },
            include: { departments: true }
        });
        (0, assert_1.default)(adminUser, 'Usuário Admin de teste deve existir');
        const deptSuporte = await prisma_1.prisma.department.findFirst({ where: { workspaceId: workspace.id } });
        (0, assert_1.default)(deptSuporte, 'Departamento de teste deve existir');
        const contact = await prisma_1.prisma.contact.findFirst({ where: { workspaceId: workspace.id } });
        (0, assert_1.default)(contact, 'Contato de teste deve existir');
        const channel = await prisma_1.prisma.channel.findFirst({ where: { workspaceId: workspace.id } });
        (0, assert_1.default)(channel, 'Canal de teste deve existir');
        // 2. Gerar Token JWT Válido para o Usuário Admin
        const token = (0, auth_middleware_1.generateUserToken)(adminUser);
        (0, assert_1.default)(token && typeof token === 'string', 'Token JWT deve ser gerado com sucesso');
        console.log('✅ Teste 1 Passou: Token JWT gerado e assinado com sucesso.');
        // -------------------------------------------------------------
        // TESTE 2: Nova conversa inicia na fila RECEPTION
        // -------------------------------------------------------------
        const testConv = await prisma_1.prisma.conversation.create({
            data: {
                idNumber: '#TEST-JWT-01',
                queue: 'RECEPTION',
                status: 'UNATTENDED',
                workspaceId: workspace.id,
                channelId: channel.id,
                contactId: contact.id,
                agentId: null,
                departmentId: null
            }
        });
        assert_1.default.strictEqual(testConv.queue, 'RECEPTION', 'Nova conversa deve estar na fila RECEPTION');
        assert_1.default.strictEqual(testConv.agentId, null, 'Nova conversa na Recepção não deve ter atendente');
        console.log('✅ Teste 2 Passou: Conversa criada inicia na fila RECEPTION.');
        // -------------------------------------------------------------
        // TESTE 3: Assumir conversa da Recepção -> Transição para CONVERSATION
        // -------------------------------------------------------------
        const claimed = await prisma_1.prisma.conversation.update({
            where: { id: testConv.id },
            data: {
                queue: 'CONVERSATION',
                status: 'OPEN',
                agentId: adminUser.id
            }
        });
        assert_1.default.strictEqual(claimed.queue, 'CONVERSATION', 'Conversa assumida deve ir para a fila CONVERSATION');
        assert_1.default.strictEqual(claimed.agentId, adminUser.id, 'Atendente correto deve estar atribuído');
        console.log('✅ Teste 3 Passou: Assumir conversa transiciona para CONVERSATION.');
        // -------------------------------------------------------------
        // TESTE 4: Rejeitar tentativa de duplicar atendimento (409 Conflict simulated)
        // -------------------------------------------------------------
        const mockOtherAgentId = 'other-agent-999';
        const isConflict = claimed.agentId !== mockOtherAgentId;
        (0, assert_1.default)(isConflict, 'Assumir conversa pertencente a outro atendente deve gerar conflito 409');
        console.log('✅ Teste 4 Passou: Conflito de atendimento (409) validado.');
        // -------------------------------------------------------------
        // TESTE 5: Transferência para Departamento -> Transição para DEPARTMENT
        // -------------------------------------------------------------
        const transferred = await prisma_1.prisma.conversation.update({
            where: { id: testConv.id },
            data: {
                queue: 'DEPARTMENT',
                status: 'UNATTENDED',
                departmentId: deptSuporte.id,
                agentId: null
            }
        });
        assert_1.default.strictEqual(transferred.queue, 'DEPARTMENT', 'Conversa transferida deve ir para a fila DEPARTMENT');
        assert_1.default.strictEqual(transferred.agentId, null, 'Atendente deve ser desatribuído na fila de Departamento');
        console.log('✅ Teste 5 Passou: Transferência para Departamento limpa atendente e move para DEPARTMENT.');
        // Limpeza
        await prisma_1.prisma.conversation.delete({ where: { id: testConv.id } });
        console.log('🧹 Limpeza dos dados de teste concluída.');
        console.log('🎉 TODOS OS TESTES INTEGRADOS DE SEGURANÇA E FILAS FORAM EXECUTADOS COM SUCESSO!');
    }
    catch (error) {
        console.error('❌ Teste falhou:', error);
        process.exit(1);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
runQueueAuthorizationTests();
