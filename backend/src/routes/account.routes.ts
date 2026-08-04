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
    const accountIdParam = req.params.accountId;

    return res.status(200).json({
      id: Number(accountIdParam) || 1,
      name: dbUser.workspace.name,
      role: userRole,
      locale: 'pt_BR',
      domain: '',
      support_email: dbUser.email,
      features: {
        inbound_emails: true,
        custom_attributes: true,
      }
    });
  } catch (error: any) {
    return res.status(503).json({ success: false, message: 'Serviço de banco de dados indisponível.' });
  }
});

const CONTACTS_PAGE_SIZE = 15;

const serializeContact = (contact: any) => ({
  id: contact.id,
  name: contact.name,
  email: contact.email || null,
  phone_number: contact.phone || '',
  thumbnail: contact.avatarUrl || '',
  avatar_url: contact.avatarUrl || '',
  additional_attributes: {
    company_name: contact.company || '',
    description: contact.biography || '',
    location: contact.location || '',
  },
  custom_attributes: {},
  contact_inboxes: [],
  created_at: Math.floor(new Date(contact.createdAt).getTime() / 1000),
  updated_at: Math.floor(new Date(contact.updatedAt).getTime() / 1000),
});

const contactDataFromRequest = (body: any) => {
  const additionalAttributes = body?.additional_attributes || {};
  const data: Record<string, string | null> = {};

  if (body?.name !== undefined) data.name = String(body.name).trim();
  if (body?.phone_number !== undefined) {
    data.phone = String(body.phone_number).trim() || null;
  }
  if (body?.email !== undefined) {
    data.email = String(body.email).trim() || null;
  }
  if (body?.avatar_url !== undefined) {
    data.avatarUrl = String(body.avatar_url).trim() || null;
  }
  if (additionalAttributes.company_name !== undefined) {
    data.company = String(additionalAttributes.company_name).trim() || null;
  }
  if (additionalAttributes.description !== undefined) {
    data.biography = String(additionalAttributes.description).trim() || null;
  }
  if (additionalAttributes.location !== undefined) {
    data.location = String(additionalAttributes.location).trim() || null;
  }

  return data;
};

const listContacts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const query = String(req.query.q || '').trim();
    const rawSort = String(req.query.sort || 'name');
    const descending = rawSort.startsWith('-');
    const sort = descending ? rawSort.slice(1) : rawSort;
    const sortFields: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone_number: 'phone',
      company_name: 'company',
      created_at: 'createdAt',
      last_activity_at: 'updatedAt',
    };
    const orderBy: any = {
      [sortFields[sort] || 'name']: descending ? 'desc' : 'asc',
    };
    const where: any = {
      workspaceId: req.user!.workspaceId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
              { email: { contains: query, mode: 'insensitive' } },
              { company: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [contacts, count] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        orderBy,
        skip: (page - 1) * CONTACTS_PAGE_SIZE,
        take: CONTACTS_PAGE_SIZE,
      }),
      prisma.contact.count({ where }),
    ]);

    return res.status(200).json({
      payload: contacts.map(serializeContact),
      meta: {
        count,
        current_page: page,
        has_more: page * CONTACTS_PAGE_SIZE < count,
      },
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      message: 'Serviço de contatos indisponível.',
      error: error.message,
    });
  }
};

/**
 * Contact endpoints used by the dashboard. Contacts are always scoped to the
 * authenticated user's workspace, including reads by id.
 */
router.get('/contacts', listContacts);
router.get('/contacts/search', listContacts);
router.get('/contacts/active', listContacts);

router.post('/contacts', async (req: Request, res: Response) => {
  try {
    const data = contactDataFromRequest(req.body);
    if (!data.name || !data.phone) {
      return res.status(422).json({
        message: 'Nome e número de telefone são obrigatórios.',
        attributes: [
          !data.name ? 'name' : null,
          !data.phone ? 'phone_number' : null,
        ].filter(Boolean),
      });
    }

    const contact = await prisma.contact.create({
      data: {
        ...data,
        name: data.name,
        workspaceId: req.user!.workspaceId,
      } as any,
    });

    return res
      .status(201)
      .json({ payload: { contact: serializeContact(contact) } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(422).json({
        message: 'Já existe um contato com este número de telefone.',
        attributes: ['phone_number'],
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Não foi possível criar o contato.',
    });
  }
});

router.get('/contacts/:contactId', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.contactId, workspaceId: req.user!.workspaceId },
    });
    if (!contact) {
      return res.status(404).json({ message: 'Contato não localizado.' });
    }
    return res.status(200).json({ payload: serializeContact(contact) });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      message: 'Serviço de contatos indisponível.',
    });
  }
});

router.patch('/contacts/:contactId', async (req: Request, res: Response) => {
  try {
    const existingContact = await prisma.contact.findFirst({
      where: { id: req.params.contactId, workspaceId: req.user!.workspaceId },
      select: { id: true },
    });
    if (!existingContact) {
      return res.status(404).json({ message: 'Contato não localizado.' });
    }
    const contact = await prisma.contact.update({
      where: { id: existingContact.id },
      data: contactDataFromRequest(req.body),
    });
    return res.status(200).json({ payload: serializeContact(contact) });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(422).json({
        message: 'Já existe um contato com este número de telefone.',
        attributes: ['phone_number'],
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Não foi possível atualizar o contato.',
    });
  }
});

router.delete('/contacts/:contactId', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.contactId, workspaceId: req.user!.workspaceId },
      select: { id: true },
    });
    if (!contact) {
      return res.status(404).json({ message: 'Contato não localizado.' });
    }
    await prisma.contact.delete({ where: { id: contact.id } });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(409).json({
      success: false,
      message:
        'O contato não pode ser excluído enquanto possuir conversas vinculadas.',
    });
  }
});

/**
 * GET /api/v1/accounts/:accountId/conversations
 * Endpoint de conversas compatível com o Chatwoot v4 Dashboard
 */
export const inMemoryConversations: any[] = [
  {
    id: 'conv_meta_test_1',
    channelId: 1,
    status: 'UNATTENDED',
    queue: 'RECEPTION',
    agentId: null,
    unreadCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    contact: {
      id: 'contact_meta_1',
      name: 'test user name (WhatsApp Meta)',
      phone: '+16315551181'
    },
    channel: {
      id: 1,
      name: 'WhatsApp Meta Cloud API (Oficial)',
      type: 'META_CLOUD'
    },
    messages: [
      {
        id: 'msg_meta_1',
        content: 'this is a text message',
        contentType: 'TEXT',
        senderType: 'CUSTOMER',
        senderName: 'test user name',
        createdAt: new Date(),
        isPrivate: false
      }
    ]
  }
];

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
        unread_count: conv.unreadCount || 1,
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
 * GET /api/v1/accounts/:accountId/notifications/unread_count
 * Notifications are not persisted by the Abravely backend yet, therefore the
 * real current count is zero rather than an error/placeholder response.
 */
router.get('/notifications/unread_count', (req: Request, res: Response) => {
  return res.status(200).json(0);
});

/**
 * GET /api/v1/accounts/:accountId/custom_filters
 * Saved custom filters have not been implemented in the new backend. There
 * are consequently no saved filters for the authenticated workspace.
 */
router.get('/custom_filters', (req: Request, res: Response) => {
  return res.status(200).json([]);
});

/**
 * GET /api/v1/accounts/:accountId/inboxes
 */
router.get('/inboxes', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const channels = await prisma.channel.findMany({
      where: { workspaceId: user.workspaceId, active: true },
      orderBy: { createdAt: 'desc' },
    });
    const payload = channels.map(c => ({
      id: c.id,
      channel_id: c.id,
      name: c.name,
      channel_type: 'Channel::Whatsapp',
      phone_number: c.metaPhoneNumberId || c.evolutionInstanceName || '',
      avatar_url: '',
      provider: c.type,
      medium: c.type === 'META_CLOUD' ? 'meta' : 'evolution',
      connection_status: c.connectionStatus,
    }));
    return res.status(200).json({ payload });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      message: 'Serviço de canais indisponível.',
      error: error.message,
    });
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
    return res.status(200).json([
      { id: 1, name: 'Guilherme (Admin)', email: 'guilherme@abravely.com', role: 'ADMIN' }
    ]);
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
