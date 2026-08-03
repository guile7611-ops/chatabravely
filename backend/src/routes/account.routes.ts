import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router({ mergeParams: true });

/**
 * GET /api/v1/accounts/:accountId/conversations
 * Endpoint de conversas compatível com o Chatwoot v4 Dashboard
 */
export const inMemoryConversations: any[] = [];

/**
 * GET /api/v1/accounts/:accountId/conversations
 * Endpoint de conversas compatível com o Chatwoot v4 Dashboard
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    let dbConversations: any[] = [];
    try {
      dbConversations = await prisma.conversation.findMany({
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
      console.warn('⚠️ [Database Offline] Utilizando conversas em memória para ambiente local:', dbErr.message);
      dbConversations = inMemoryConversations;
    }

    if (!dbConversations.length && inMemoryConversations.length) {
      dbConversations = inMemoryConversations;
    }

    const formattedPayload = dbConversations.map(conv => {
      const isUnattended = conv.status === 'UNATTENDED' || conv.queue === 'RECEPTION' || conv.queue === 'DEPARTMENT' || !conv.agentId;
      const statusString = conv.status === 'CLOSED' || conv.queue === 'CLOSED' ? 'resolved' : (isUnattended ? 'pending' : 'open');
      return {
        id: conv.id,
        account_id: 1,
        uuid: conv.id,
        additional_attributes: {},
        agent_last_seen_at: 0,
        assignee_last_seen_at: 0,
        can_reply: true,
        created_at: new Date(conv.createdAt).getTime(),
        custom_attributes: {},
        inbox_id: conv.channelId || 1,
        labels: [],
        muted: false,
        snoozed_until: null,
        status: statusString,
        createdAt: new Date(conv.createdAt).getTime(),
        timestamp: new Date(conv.updatedAt).getTime(),
        unread_count: conv.unreadCount || 0,
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
        messages: conv.messages.map((m: any) => ({
          id: m.id,
          content: m.content,
          account_id: 1,
          inbox_id: conv.channelId || 1,
          conversation_id: conv.id,
          message_type: m.senderType === 'CUSTOMER' || m.senderType === 'CONTACT' ? 0 : 1,
          created_at: new Date(m.createdAt).getTime(),
          updated_at: new Date(m.createdAt).getTime(),
          private: m.isPrivate || false,
          status: 'sent',
          sender: {
            id: m.senderType === 'CUSTOMER' || m.senderType === 'CONTACT' ? (conv.contact?.id || 1) : 1,
            name: m.senderName || (m.senderType === 'CUSTOMER' ? conv.contact?.name : 'Atendente'),
            type: m.senderType === 'CUSTOMER' || m.senderType === 'CONTACT' ? 'contact' : 'user'
          }
        }))
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
 * GET /api/v1/accounts/:accountId/conversations/unread_count
 */
router.get('/conversations/unread_count', (req: Request, res: Response) => {
  return res.status(200).json({ mine_count: 0, unassigned_count: 0, assigned_count: 0 });
});

/**
 * GET /api/v1/accounts/:accountId/cache_keys
 */
router.get('/cache_keys', (req: Request, res: Response) => {
  return res.status(200).json({ cache_keys: { label: 1, inbox: 1, team: 1 } });
});

/**
 * GET /api/v1/accounts/:accountId/notifications
 */
router.get('/notifications', (req: Request, res: Response) => {
  return res.status(200).json({ data: { meta: { unread_count: 0, count: 0 }, payload: [] } });
});

/**
 * GET /api/v1/accounts/:accountId/inboxes
 */
router.get('/inboxes', async (req: Request, res: Response) => {
  try {
    const channels = await prisma.channel.findMany();
    const payload = channels.map(c => ({
      id: c.id,
      channel_id: c.id,
      name: c.name,
      channel_type: 'Channel::Whatsapp',
      phone_number: c.metaPhoneNumberId || c.evolutionInstanceName || '',
      avatar_url: ''
    }));
    return res.status(200).json({ payload });
  } catch (error) {
    return res.status(200).json({ payload: [] });
  }
});

/**
 * GET /api/v1/accounts/:accountId/agents
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(200).json([]);
  }
});

/**
 * GET /api/v1/accounts/:accountId/teams
 */
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const depts = await prisma.department.findMany();
    return res.status(200).json(depts);
  } catch (error) {
    return res.status(200).json([]);
  }
});

/**
 * GET /api/v1/accounts/:accountId/labels
 */
router.get('/labels', (req: Request, res: Response) => {
  return res.status(200).json({ payload: [] });
});

/**
 * GET /api/v1/accounts/:accountId/custom_attribute_definitions
 */
router.get('/custom_attribute_definitions', (req: Request, res: Response) => {
  return res.status(200).json([]);
});

/**
 * GET /api/v1/accounts/:accountId/custom_views
 */
router.get('/custom_views', (req: Request, res: Response) => {
  return res.status(200).json([]);
});

/**
 * GET /api/v1/accounts/:accountId/dashboard_apps
 */
router.get('/dashboard_apps', (req: Request, res: Response) => {
  return res.status(200).json({ payload: [] });
});

/**
 * GET /api/v1/accounts/:accountId/canned_responses
 */
router.get('/canned_responses', (req: Request, res: Response) => {
  return res.status(200).json([]);
});

/**
 * GET /api/v1/accounts/:accountId/automation_rules
 */
router.get('/automation_rules', (req: Request, res: Response) => {
  return res.status(200).json({ payload: [] });
});

export default router;
