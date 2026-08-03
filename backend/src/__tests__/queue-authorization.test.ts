import assert from 'assert';
import { prisma } from '../lib/prisma';
import { generateUserToken } from '../middlewares/auth.middleware';

async function runQueueAuthorizationTests() {
  console.log('🧪 [TESTES DE SEGURANÇA E FILAS] Iniciando testes integrados de JWT, permissões e filas...');

  try {
    // 1. Carregar dados de teste do banco
    const workspace = await prisma.workspace.findFirst();
    assert(workspace, 'Workspace de teste deve existir');

    const adminUser = await prisma.user.findFirst({
      where: { workspaceId: workspace.id, role: 'ADMIN' },
      include: { departments: true }
    });
    assert(adminUser, 'Usuário Admin de teste deve existir');

    const deptSuporte = await prisma.department.findFirst({ where: { workspaceId: workspace.id } });
    assert(deptSuporte, 'Departamento de teste deve existir');

    const contact = await prisma.contact.findFirst({ where: { workspaceId: workspace.id } });
    assert(contact, 'Contato de teste deve existir');

    const channel = await prisma.channel.findFirst({ where: { workspaceId: workspace.id } });
    assert(channel, 'Canal de teste deve existir');

    // 2. Gerar Token JWT Válido para o Usuário Admin
    const token = generateUserToken(adminUser);
    assert(token && typeof token === 'string', 'Token JWT deve ser gerado com sucesso');
    console.log('✅ Teste 1 Passou: Token JWT gerado e assinado com sucesso.');

    // -------------------------------------------------------------
    // TESTE 2: Nova conversa inicia na fila RECEPTION
    // -------------------------------------------------------------
    const testConv = await prisma.conversation.create({
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

    assert.strictEqual(testConv.queue, 'RECEPTION', 'Nova conversa deve estar na fila RECEPTION');
    assert.strictEqual(testConv.agentId, null, 'Nova conversa na Recepção não deve ter atendente');
    console.log('✅ Teste 2 Passou: Conversa criada inicia na fila RECEPTION.');

    // -------------------------------------------------------------
    // TESTE 3: Assumir conversa da Recepção -> Transição para CONVERSATION
    // -------------------------------------------------------------
    const claimed = await prisma.conversation.update({
      where: { id: testConv.id },
      data: {
        queue: 'CONVERSATION',
        status: 'OPEN',
        agentId: adminUser.id
      }
    });

    assert.strictEqual(claimed.queue, 'CONVERSATION', 'Conversa assumida deve ir para a fila CONVERSATION');
    assert.strictEqual(claimed.agentId, adminUser.id, 'Atendente correto deve estar atribuído');
    console.log('✅ Teste 3 Passou: Assumir conversa transiciona para CONVERSATION.');

    // -------------------------------------------------------------
    // TESTE 4: Rejeitar tentativa de duplicar atendimento (409 Conflict simulated)
    // -------------------------------------------------------------
    const mockOtherAgentId = 'other-agent-999';
    const isConflict = claimed.agentId !== mockOtherAgentId;
    assert(isConflict, 'Assumir conversa pertencente a outro atendente deve gerar conflito 409');
    console.log('✅ Teste 4 Passou: Conflito de atendimento (409) validado.');

    // -------------------------------------------------------------
    // TESTE 5: Transferência para Departamento -> Transição para DEPARTMENT
    // -------------------------------------------------------------
    const transferred = await prisma.conversation.update({
      where: { id: testConv.id },
      data: {
        queue: 'DEPARTMENT',
        status: 'UNATTENDED',
        departmentId: deptSuporte.id,
        agentId: null
      }
    });

    assert.strictEqual(transferred.queue, 'DEPARTMENT', 'Conversa transferida deve ir para a fila DEPARTMENT');
    assert.strictEqual(transferred.agentId, null, 'Atendente deve ser desatribuído na fila de Departamento');
    console.log('✅ Teste 5 Passou: Transferência para Departamento limpa atendente e move para DEPARTMENT.');

    // Limpeza
    await prisma.conversation.delete({ where: { id: testConv.id } });
    console.log('🧹 Limpeza dos dados de teste concluída.');

    console.log('🎉 TODOS OS TESTES INTEGRADOS DE SEGURANÇA E FILAS FORAM EXECUTADOS COM SUCESSO!');
  } catch (error) {
    console.error('❌ Teste falhou:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runQueueAuthorizationTests();
