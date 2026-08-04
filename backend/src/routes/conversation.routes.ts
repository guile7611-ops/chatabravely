import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EvolutionService } from '../services/evolution.service';
import { MetaService } from '../services/meta.service';
import { emitToWorkspace } from '../socket/socket';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticação JWT em todas as rotas de conversas
router.use(authenticateToken);

/**
 * Helper único para buscar uma conversa no banco com isolamento estrito por Workspace
 */
export async function findWorkspaceConversation(id: string, workspaceId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: id,
      workspaceId: workspaceId
    },
    include: {
      contact: true,
      channel: true,
      department: true,
      agent: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
}

/**
 * GET /api/v1/conversations
 * Listar conversas por fila (RECEPTION, DEPARTMENT, CONVERSATION, CLOSED) ou departamento
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const queue = req.query.queue as string;
    const status = req.query.status as string;
    const assigneeType = req.query.assignee_type as string;
    const departmentId = req.query.departmentId as string;
    const agentId = req.query.agentId as string;
    const search = req.query.search as string;

    const whereClause: any = {
      workspaceId: user.workspaceId
    };

    if (queue) {
      whereClause.queue = queue;
    } else if (status) {
      if (assigneeType === 'unassigned' || status === 'UNATTENDED') {
        whereClause.queue = { in: ['RECEPTION', 'DEPARTMENT'] };
      } else if (status === 'OPEN') {
        whereClause.queue = 'CONVERSATION';
      } else if (status === 'CLOSED') {
        whereClause.queue = 'CLOSED';
      }
    } else if (assigneeType === 'unassigned') {
      // A aba Recepção representa conversas sem atendente, que ficam nas filas
      // RECEPTION/DEPARTMENT no contrato Abravely.
      whereClause.queue = { in: ['RECEPTION', 'DEPARTMENT'] };
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    if (agentId) {
      whereClause.agentId = agentId;
    }

    if (search) {
      whereClause.contact = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        contact: true,
        channel: true,
        department: true,
        agent: {
          select: { id: true, name: true, email: true, role: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedPayload = conversations.map(c => {
      const lastMsg = c.messages?.[0];
      return {
        id: c.id,
        inbox_id: c.channelId || 1,
        account_id: 1,
        status: c.queue === 'CLOSED' || c.status === 'CLOSED' ? 'resolved' : (c.agentId ? 'open' : 'pending'),
        assignee_id: c.agentId || null,
        unread_count: c.unreadCount || 0,
        created_at: Math.floor(new Date(c.createdAt).getTime() / 1000),
        updated_at: Math.floor(new Date(c.updatedAt).getTime() / 1000),
        meta: {
          sender: {
            id: c.contact?.id || 'contact_1',
            name: c.contact?.name || 'Cliente WhatsApp',
            phone_number: c.contact?.phone || '',
            avatar_url: ''
          },
          channel: c.channel?.type || 'Channel::Whatsapp'
        },
        messages: lastMsg ? [
          {
            id: lastMsg.id,
            content: lastMsg.content,
            content_type: lastMsg.contentType?.toLowerCase() || 'text',
            message_type: lastMsg.senderType === 'AGENT' ? 1 : 0,
            created_at: Math.floor(new Date(lastMsg.createdAt).getTime() / 1000),
            private: lastMsg.isPrivate || false
          }
        ] : []
      };
    });

    return res.json({
      success: true,
      count: conversations.length,
      payload: formattedPayload,
      meta: {
        mine_count: formattedPayload.filter(c => c.assignee_id).length,
        unassigned_count: formattedPayload.filter(c => !c.assignee_id).length,
        all_count: formattedPayload.length,
        assigned_count: formattedPayload.filter(c => c.assignee_id).length,
      },
      conversations: formattedPayload
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar conversas:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/conversations/:id
 * Obter histórico detalhado da conversa, mensagens e logs de atividade
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' }
    });

    const activityLogs = await prisma.activityLog.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' }
    });

    // Zerar contador de não lidas ao abrir a conversa
    if (conversation.unreadCount > 0) {
      await prisma.conversation.update({
        where: { id: id },
        data: { unreadCount: 0 }
      });
    }

    return res.json({
      success: true,
      conversation: {
        ...conversation,
        messages,
        activityLogs
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/claim
 * Assumir conversa (Apenas das filas RECEPTION ou DEPARTMENT)
 */
router.post('/:id/claim', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    // REGRA 1: Aceitar assumir APENAS se a conversa estiver em RECEPTION ou DEPARTMENT
    if (conversation.queue !== 'RECEPTION' && conversation.queue !== 'DEPARTMENT') {
      return res.status(400).json({
        success: false,
        message: 'Apenas conversas nas filas de Recepção ou Departamentos podem ser assumidas.'
      });
    }

    // REGRA 2: Se a conversa já foi assumida por outro atendente, rejeitar (409 Conflict)
    if (conversation.agentId && conversation.agentId !== user.id) {
      return res.status(409).json({
        success: false,
        message: 'A conversa já foi assumida por outro atendente.'
      });
    }

    // REGRA 3: Se a conversa estiver na fila DEPARTMENT, validar pertencimento ao setor
    if (conversation.queue === 'DEPARTMENT' && conversation.departmentId) {
      const isMember = user.departmentIds && user.departmentIds.includes(conversation.departmentId);
      if (user.role !== 'ADMIN' && !isMember) {
        return res.status(403).json({
          success: false,
          message: 'Você não pertence ao departamento desta conversa.'
        });
      }
    }

    const updated = await prisma.conversation.update({
      where: { id: id },
      data: {
        queue: 'CONVERSATION',
        status: 'OPEN',
        agentId: user.id,
        updatedAt: new Date()
      },
      include: { contact: true, channel: true, department: true, agent: true }
    });

    const actionText = `👤 Atendimento assumido por ${user.name}`;
    const log = await prisma.activityLog.create({
      data: {
        conversationId: id,
        userName: user.name,
        action: actionText
      }
    });

    emitToWorkspace(user.workspaceId, 'conversation:claimed', {
      conversationId: id,
      conversation: updated,
      log
    });

    emitToWorkspace(user.workspaceId, 'conversation:updated', {
      conversationId: id,
      conversation: updated,
      log
    });

    return res.json({ success: true, conversation: updated, log });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/transfer
 * Transferir conversa para departamento ou atendente direto com validações estritas
 */
router.post('/:id/transfer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId, agentId } = req.body;
    const user = req.user!;

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    // REGRA DE SEGURANÇA 1: Não transferir conversas encerradas (CLOSED)
    if (conversation.queue === 'CLOSED' || conversation.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Conversas encerradas não podem ser transferidas.' });
    }

    // REGRA DE SEGURANÇA 2: Validar executor da transferência
    // ADMIN pode transferir qualquer conversa. AGENT responsável pode transferir sua própria conversa.
    // AGENT pode transferir conversa não assumida da RECEPTION exclusivamente para um departamento.
    const isAssigned = conversation.agentId === user.id;
    const isAdmin = user.role === 'ADMIN';
    const isReceptionDeptTransfer = conversation.queue === 'RECEPTION' && conversation.agentId === null && departmentId && !agentId;

    if (!isAssigned && !isAdmin && !isReceptionDeptTransfer) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para transferir a conversa. Apenas o responsável, ADMIN ou transferência de Recepção para Departamento são permitidos.'
      });
    }

    let targetQueue: 'DEPARTMENT' | 'CONVERSATION' = 'DEPARTMENT';
    let targetDeptId: string | null = departmentId || null;
    let targetAgentId: string | null = agentId || null;
    let actionText = '';

    // Validar atendente destino (se informado)
    if (agentId) {
      const targetUser = await prisma.user.findFirst({
        where: { id: agentId, workspaceId: user.workspaceId },
        include: { departments: true }
      });

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Atendente de destino não encontrado no workspace.' });
      }

      // Se departmentId também foi informado, validar se o atendente pertence ao departamento
      if (departmentId) {
        const userDeptIds = targetUser.departments.map(d => d.id);
        if (!userDeptIds.includes(departmentId)) {
          return res.status(400).json({
            success: false,
            message: 'O atendente de destino não pertence ao departamento informado.'
          });
        }
      }

      targetQueue = 'CONVERSATION';
      actionText = `🤝 Conversa transferida diretamente para ${targetUser.name} por ${user.name} em ${new Date().toLocaleString('pt-BR')}`;
    } else if (departmentId) {
      // Validar departamento destino
      const dept = await prisma.department.findFirst({
        where: { id: departmentId, workspaceId: user.workspaceId }
      });

      if (!dept) {
        return res.status(404).json({ success: false, message: 'Departamento de destino não encontrado no workspace.' });
      }

      targetQueue = 'DEPARTMENT';
      targetAgentId = null; // Limpa atendente ao enviar para fila de departamento
      actionText = `🤝 Conversa transferida para o departamento "${dept.name}" por ${user.name} em ${new Date().toLocaleString('pt-BR')}`;
    } else {
      return res.status(400).json({ success: false, message: 'Informe o departamento ou atendente de destino.' });
    }

    const updated = await prisma.conversation.update({
      where: { id: id },
      data: {
        queue: targetQueue,
        status: targetQueue === 'CONVERSATION' ? 'OPEN' : 'UNATTENDED',
        departmentId: targetDeptId,
        agentId: targetAgentId,
        updatedAt: new Date()
      },
      include: { contact: true, channel: true, department: true, agent: true }
    });

    const log = await prisma.activityLog.create({
      data: {
        conversationId: id,
        userName: user.name,
        action: actionText
      }
    });

    emitToWorkspace(user.workspaceId, 'conversation:transferred', {
      conversationId: id,
      conversation: updated,
      log
    });

    emitToWorkspace(user.workspaceId, 'conversation:updated', {
      conversationId: id,
      conversation: updated,
      log
    });

    return res.json({ success: true, conversation: updated, log });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/takeover
 * Endpoint de Takeover auditado para ADMIN assumir a conversa
 */
router.post('/:id/takeover', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Apenas Gestores (ADMIN) podem realizar takeover.' });
    }

    const conversation = await findWorkspaceConversation(id, user.workspaceId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    if (conversation.queue === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Não é possível realizar takeover em conversa encerrada.' });
    }

    const updated = await prisma.conversation.update({
      where: { id: id },
      data: {
        queue: 'CONVERSATION',
        status: 'OPEN',
        agentId: user.id,
        updatedAt: new Date()
      },
      include: { contact: true, channel: true, department: true, agent: true }
    });

    const log = await prisma.activityLog.create({
      data: {
        conversationId: id,
        userName: user.name,
        action: `⚡ Takeover realizado por ADMIN ${user.name}`
      }
    });

    emitToWorkspace(user.workspaceId, 'conversation:claimed', { conversationId: id, conversation: updated, log });
    emitToWorkspace(user.workspaceId, 'conversation:updated', { conversationId: id, conversation: updated, log });

    return res.json({ success: true, conversation: updated, log });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/messages
 * Enviar mensagem (Texto ou Nota Privada) com autorização estrita
 */
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isPrivate, avatarPill } = req.body;
    const user = req.user!;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'Conteúdo da mensagem é obrigatório' });
    }

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    // REGRA DE SEGURANÇA 1: Rejeitar se a conversa estiver encerrada
    if (conversation.queue === 'CLOSED' || conversation.status === 'CLOSED') {
      return res.status(403).json({
        success: false,
        message: 'Conversas encerradas não podem receber mensagens.'
      });
    }

    // REGRA DE SEGURANÇA 2: Rejeitar se agentId for null (Sem atendente atribuído)
    if (!conversation.agentId) {
      return res.status(403).json({
        success: false,
        message: 'A conversa não possui atendente atribuído. Assuma a conversa antes de enviar mensagens.'
      });
    }

    // REGRA DE SEGURANÇA 3: Rejeitar se a conversa não estiver na fila CONVERSATION
    if (conversation.queue !== 'CONVERSATION') {
      return res.status(403).json({
        success: false,
        message: 'Assuma a conversa antes de enviar mensagens.'
      });
    }

    // REGRA DE SEGURANÇA 4: Apenas o agentId atribuído pode enviar mensagem (SEM bypass silencioso de ADMIN)
    if (conversation.agentId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Esta conversa pertence a outro atendente. Faça o takeover/assuma explicitamente antes de enviar.'
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: content,
        contentType: 'TEXT',
        senderType: isPrivate ? 'NOTE' : 'AGENT',
        senderName: user.name,
        avatarPill: avatarPill || 'GT',
        isPrivate: !!isPrivate
      }
    });

    if (!isPrivate && conversation.contact.phone) {
      const channel = conversation.channel;
      try {
        if (channel.type === 'EVOLUTION' && channel.evolutionInstanceName) {
          await EvolutionService.sendTextMessage(
            channel.evolutionInstanceName,
            conversation.contact.phone,
            content
          );
        } else if (channel.type === 'META_CLOUD' && channel.metaPhoneNumberId && channel.metaToken) {
          await MetaService.sendTextMessage(
            channel.metaPhoneNumberId,
            channel.metaToken,
            conversation.contact.phone,
            content
          );
        }
      } catch (dispatchError: any) {
        console.warn(`⚠️ [ConversationRoute] Aviso: Mensagem salva mas falhou disparo externo: ${dispatchError.message}`);
      }
    }

    await prisma.conversation.update({
      where: { id: id },
      data: { updatedAt: new Date() }
    });

    emitToWorkspace(user.workspaceId, 'message:new', {
      message: message,
      conversationId: conversation.id
    });

    return res.json({ success: true, message });
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/close
 * Encerrar conversa com autorização e auditoria
 */
router.post('/:id/close', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user!;

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    // Validar permissão: apenas o atendente responsável ou ADMIN pode encerrar
    const isAssigned = conversation.agentId === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o atendente responsável ou um Gestor (ADMIN) pode encerrar a conversa.'
      });
    }

    const closed = await prisma.conversation.update({
      where: { id: id },
      data: {
        queue: 'CLOSED',
        status: 'CLOSED',
        closedAt: new Date(),
        closureReason: reason || 'Resolvido pelo Atendente',
        updatedAt: new Date()
      },
      include: { contact: true, channel: true, department: true, agent: true }
    });

    const log = await prisma.activityLog.create({
      data: {
        conversationId: id,
        userName: user.name,
        action: `✅ Conversa encerrada por ${user.name}. Motivo: ${closed.closureReason}`
      }
    });

    emitToWorkspace(user.workspaceId, 'conversation:updated', {
      conversationId: id,
      conversation: closed,
      log
    });

    return res.json({ success: true, conversation: closed, log });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/reopen
 * Reabrir conversa (Retorna para a fila RECEPTION com auditoria)
 */
router.post('/:id/reopen', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }

    // Validar permissão: apenas o atendente responsável anterior ou ADMIN pode reabrir
    const isPreviousAgent = conversation.agentId === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isPreviousAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o atendente responsável anterior ou um Gestor (ADMIN) pode reabrir a conversa.'
      });
    }

    const reopened = await prisma.conversation.update({
      where: { id: id },
      data: {
        queue: 'RECEPTION',
        status: 'UNATTENDED',
        agentId: null,
        departmentId: null,
        closedAt: null,
        closureReason: null,
        updatedAt: new Date()
      },
      include: { contact: true, channel: true, department: true, agent: true }
    });

    const log = await prisma.activityLog.create({
      data: {
        conversationId: id,
        userName: user.name,
        action: `🔔 Conversa reaberta e retornou para a Recepção por ${user.name}`
      }
    });

    emitToWorkspace(user.workspaceId, 'conversation:updated', {
      conversationId: id,
      conversation: reopened,
      log
    });

    return res.json({ success: true, conversation: reopened, log });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/conversations/:id/send-template
 * Enviar mensagem de template HSM via WhatsApp Meta Cloud API
 */
router.post('/:id/send-template', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { templateName, languageCode, parameters, templateText } = req.body;
    const user = req.user!;

    const conversation = await findWorkspaceConversation(id, user.workspaceId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada.' });
    }

    if (conversation.channel.type !== 'META_CLOUD') {
      return res.status(400).json({ success: false, message: 'Disparo de templates HSM é exclusivo para canais WhatsApp Meta Cloud API.' });
    }

    const { metaPhoneNumberId, metaToken } = conversation.channel;

    if (!metaPhoneNumberId || !metaToken) {
      return res.status(400).json({ success: false, message: 'Credenciais da Meta Cloud API não estão configuradas neste canal.' });
    }

    const recipientPhone = conversation.contact.phone || '';
    if (!recipientPhone) {
      return res.status(400).json({ success: false, message: 'Contato sem número de telefone cadastrado.' });
    }

    const paramArray: string[] = Array.isArray(parameters) ? parameters : [];

    // Disparar template via Meta Cloud API
    await MetaService.sendTemplateMessage(
      metaPhoneNumberId,
      metaToken,
      recipientPhone,
      templateName,
      languageCode || 'pt_BR',
      paramArray
    );

    // Formatar texto exibido no chat
    let bodyContent = templateText || `[Template Meta: ${templateName}]`;
    if (paramArray.length > 0) {
      paramArray.forEach((val, idx) => {
        bodyContent = bodyContent.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
      });
    }

    // Salvar mensagem no PostgreSQL
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        content: bodyContent,
        contentType: 'TEXT',
        senderType: 'AGENT',
        senderName: user.name,
        avatarPill: user.name.slice(0, 2).toUpperCase()
      }
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    emitToWorkspace(user.workspaceId, 'message:new', {
      conversationId: id,
      message
    });

    return res.json({ success: true, message });
  } catch (error: any) {
    console.error('❌ Erro no envio de Template HSM:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
