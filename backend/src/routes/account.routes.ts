import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getMappedRolePayload } from '../utils/roleMapper';

const router = Router({ mergeParams: true });

// Exigir Autenticação JWT para rotas de conta
router.use(authenticateToken);

/**
 * GET /api/v1/accounts/:accountId
 * Endpoint de dados da conta / workspace para a barra lateral e layout do frontend
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userToken = req.user!;
    const dbUser = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { workspace: true }
    });

    if (!dbUser || !dbUser.workspace) {
      return res.status(404).json({ success: false, message: 'Conta ou workspace não localizado.' });
    }

    const { role: userRole } = getMappedRolePayload(dbUser.role);
    const accountId = Number(req.params.accountId);
    if (!Number.isInteger(accountId) || accountId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Identificador da conta inválido.',
      });
    }

    return res.status(200).json({
      id: accountId,
      name: dbUser.workspace.name,
      role: userRole,
      locale: 'pt_BR',
      domain: '',
      support_email: dbUser.email,
      features: {},
    });
  } catch (error: any) {
    return res.status(503).json({ success: false, message: 'Serviço de banco de dados indisponível.' });
  }
});
/**
 * GET /api/v1/accounts/:accountId/conversations
 * Endpoint de conversas compatível com o Chatwoot v4 Dashboard
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    let dbConversations: any[] = [];
    try {
      dbConversations = await prisma.conversation.findMany({
        where: { workspaceId: req.user!.workspaceId },
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
        orderBy: { updatedAt: 'desc' },
        take: 50
      });
    } catch (dbErr: any) {
      console.error('Falha ao consultar conversas no PostgreSQL:', dbErr.message);
      throw dbErr;
    }

    const formattedPayload = dbConversations.map(conv => {
      const isUnattended = conv.status === 'UNATTENDED' || conv.queue === 'RECEPTION' || conv.queue === 'DEPARTMENT' || !conv.agentId;
      const statusString = conv.status === 'CLOSED' || conv.queue === 'CLOSED' ? 'resolved' : (isUnattended ? 'pending' : 'open');
      const createdAtSec = Math.floor(new Date(conv.createdAt || Date.now()).getTime() / 1000);
      const updatedAtSec = Math.floor(new Date(conv.updatedAt || Date.now()).getTime() / 1000);

      return {
        id: conv.id,
        account_id: 1,
        uuid: conv.id,
        additional_attributes: {},
        agent_last_seen_at: 0,
        assignee_last_seen_at: 0,
        can_reply: true,
        created_at: createdAtSec,
        custom_attributes: {},
        inbox_id: 1,
        labels: [],
        muted: false,
        snoozed_until: null,
        status: statusString,
        createdAt: createdAtSec,
        timestamp: updatedAtSec,
        unread_count: conv.unreadCount ?? 0,
        meta: {
          sender: {
            id: conv.contact?.id || 1,
            name: conv.contact?.name || 'Cliente WhatsApp',
            avatar_url: '',
            type: 'contact',
            phone_number: conv.contact?.phone || ''
          },
          assignee: conv.agent ? {
            id: conv.agent.id,
            name: conv.agent.name,
            email: conv.agent.email,
            role: conv.agent.role
          } : null,
          team: conv.department ? {
            id: conv.department.id,
            name: conv.department.name
          } : null,
          hmac_verified: false
        },
        messages: (conv.messages || []).map((m: any) => {
          const msgCreatedSec = Math.floor(new Date(m.createdAt || Date.now()).getTime() / 1000);
          return {
            id: m.id,
            content: m.content,
            account_id: 1,
            inbox_id: 1,
            conversation_id: conv.id,
            message_type: m.senderType === 'CUSTOMER' || m.senderType === 'CONTACT' ? 0 : 1,
            created_at: msgCreatedSec,
            updated_at: msgCreatedSec,
            private: m.isPrivate || false,
            status: 'sent',
            sender: {
              id: m.senderType === 'CUSTOMER' || m.senderType === 'CONTACT' ? (conv.contact?.id || 1) : 1,
              name: m.senderName || (m.senderType === 'CUSTOMER' ? conv.contact?.name : 'Atendente'),
              type: m.senderType === 'CUSTOMER' || m.senderType === 'CONTACT' ? 'contact' : 'user'
            }
          };
        })
      };
    });

    return res.status(200).json({
      data: {
        payload: formattedPayload,
        meta: {
          mine_count: formattedPayload.filter(c => c.meta.assignee).length,
          unassigned_count: formattedPayload.filter(c => !c.meta.assignee).length,
          all_count: formattedPayload.length,
          assigned_count: formattedPayload.filter(c => c.meta.assignee).length
        }
      }
    });
  } catch (error: any) {
    return res.status(503).json({
      error: 'SERVICE_UNAVAILABLE',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/accounts/:accountId/conversations/unread_counts
 *
 * Chatwoot's dashboard uses this payload to render the badges in the sidebar.
 * The counts are derived from the authenticated user's workspace; no local
 * fallback data is used here.
 */
router.get('/conversations/unread_counts', async (req: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { workspaceId: req.user!.workspaceId },
      select: {
        unreadCount: true,
        channelId: true,
        departmentId: true,
      },
    });

    const inboxes: Record<string, number> = {};
    const teams: Record<string, number> = {};
    let allCount = 0;

    conversations.forEach(conversation => {
      const unreadCount = Math.max(0, Number(conversation.unreadCount) || 0);
      if (!unreadCount) return;

      allCount += unreadCount;
      inboxes[conversation.channelId] = (inboxes[conversation.channelId] || 0) + unreadCount;

      if (conversation.departmentId) {
        teams[conversation.departmentId] = (teams[conversation.departmentId] || 0) + unreadCount;
      }
    });

    return res.status(200).json({
      payload: {
        all_count: allCount,
        inboxes,
        labels: {},
        teams,
      },
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      message: 'ServiÃ§o de banco de dados indisponÃ­vel.',
    });
  }
});

/**
 * Legacy singular endpoint kept for callers that still use it.
 */
router.get('/conversations/unread_count', async (req: Request, res: Response) => {
  try {
    const result = await prisma.conversation.aggregate({
      where: { workspaceId: req.user!.workspaceId },
      _sum: { unreadCount: true },
    });
    return res.status(200).json({
      mine_count: 0,
      unassigned_count: 0,
      assigned_count: result._sum.unreadCount || 0,
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      message: 'ServiÃ§o de banco de dados indisponÃ­vel.',
    });
  }
});

/**
 * GET /api/v1/accounts/:accountId/canned_responses
 * Temporary compatibility endpoint. Quick replies will receive their own
 * workspace-scoped API in the next migration step.
 */
router.get('/canned_responses', (req: Request, res: Response) => {
  return res.status(200).json([]);
});

export default router;
