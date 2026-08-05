import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middlewares/auth.middleware';
import { EvolutionService } from '../services/evolution.service';
import { MetaService } from '../services/meta.service';
import { emitToWorkspace } from '../socket/socket';

const router = Router();
const PAGE_SIZE = 15;

router.use(authenticateToken);

const serializeContact = (contact: any) => ({
  id: contact.id,
  name: contact.name,
  email: contact.email || null,
  phone_number: contact.phone || '',
  thumbnail: contact.avatarUrl || '',
  avatar_url: contact.avatarUrl || '',
  additional_attributes: { company_name: contact.company || '' },
  custom_attributes: {},
  contact_inboxes: [],
  created_at: Math.floor(new Date(contact.createdAt).getTime() / 1000),
  updated_at: Math.floor(new Date(contact.updatedAt).getTime() / 1000),
});

const contactData = (body: any) => {
  const additional = body?.additional_attributes || {};
  return {
    ...(body?.name !== undefined && { name: String(body.name).trim() }),
    ...(body?.phone_number !== undefined && {
      phone: String(body.phone_number).trim() || null,
    }),
    ...(additional.company_name !== undefined && {
      company: String(additional.company_name).trim() || null,
    }),
  };
};

const listContacts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const query = String(req.query.q || '').trim();
    const where: any = {
      workspaceId: req.user!.workspaceId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
              { company: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [contacts, count] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.contact.count({ where }),
    ]);
    return res.json({
      payload: contacts.map(serializeContact),
      meta: {
        count,
        current_page: page,
        has_more: page * PAGE_SIZE < count,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar os contatos.',
    });
  }
};

router.get('/', listContacts);
router.get('/search', listContacts);

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = contactData(req.body);
    if (!data.name || !data.phone) {
      return res.status(422).json({
        message: 'Nome e número de telefone são obrigatórios.',
        attributes: [!data.name ? 'name' : null, !data.phone ? 'phone_number' : null].filter(Boolean),
      });
    }
    const contact = await prisma.contact.create({
      data: { ...data, name: data.name, workspaceId: req.user!.workspaceId },
    });
    return res.status(201).json({ payload: { contact: serializeContact(contact) } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(422).json({
        message: 'Já existe um contato com este número de telefone.',
        attributes: ['phone_number'],
      });
    }
    return res.status(500).json({ success: false, message: 'Não foi possível criar o contato.' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const contact = await prisma.contact.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
  });
  if (!contact) return res.status(404).json({ message: 'Contato não encontrado.' });
  return res.json({ payload: serializeContact(contact) });
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!contact) return res.status(404).json({ message: 'Contato não encontrado.' });
    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: contactData(req.body),
    });
    return res.json({ payload: serializeContact(updated) });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(422).json({
        message: 'Já existe um contato com este número de telefone.',
        attributes: ['phone_number'],
      });
    }
    return res.status(500).json({ message: 'Não foi possível atualizar o contato.' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!contact) return res.status(404).json({ message: 'Contato não encontrado.' });
    await prisma.contact.delete({ where: { id: contact.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(409).json({
      message: 'O contato não pode ser excluído enquanto possuir conversas.',
    });
  }
});

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else value += character;
  }
  values.push(value.trim());
  return values;
};

router.post('/import', async (req: Request, res: Response) => {
  try {
    const content = String(req.body?.content || '').replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ message: 'O CSV deve possuir cabeçalho e ao menos um contato.' });
    }
    const headers = parseCsvLine(lines[0]).map(value => value.toLowerCase());
    const indexes = {
      name: headers.findIndex(value => ['nome', 'name'].includes(value)),
      phone: headers.findIndex(value => ['telefone', 'phone', 'phone_number'].includes(value)),
      company: headers.findIndex(value => ['empresa', 'company'].includes(value)),
    };
    if (indexes.name < 0 || indexes.phone < 0) {
      return res.status(400).json({ message: 'O CSV deve conter as colunas Nome e Telefone.' });
    }
    let imported = 0;
    const errors: Array<{ line: number; message: string }> = [];
    for (let index = 1; index < lines.length; index += 1) {
      const row = parseCsvLine(lines[index]);
      const name = row[indexes.name]?.trim();
      const phone = row[indexes.phone]?.trim();
      if (!name || !phone) {
        errors.push({ line: index + 1, message: 'Nome e telefone são obrigatórios.' });
        continue;
      }
      try {
        await prisma.contact.upsert({
          where: { workspaceId_phone: { workspaceId: req.user!.workspaceId, phone } },
          update: { name, company: indexes.company >= 0 ? row[indexes.company]?.trim() || null : undefined },
          create: {
            name,
            phone,
            company: indexes.company >= 0 ? row[indexes.company]?.trim() || null : null,
            workspaceId: req.user!.workspaceId,
          },
        });
        imported += 1;
      } catch (error) {
        errors.push({ line: index + 1, message: 'Não foi possível importar a linha.' });
      }
    }
    return res.json({ success: true, imported, errors });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível importar os contatos.' });
  }
});

const csvValue = (value: unknown) => `"${String(value || '').replace(/"/g, '""')}"`;

router.post('/export', async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { workspaceId: req.user!.workspaceId },
      orderBy: { name: 'asc' },
    });
    const rows = [
      'Nome,Empresa,Telefone',
      ...contacts.map(contact =>
        [contact.name, contact.company, contact.phone].map(csvValue).join(',')
      ),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="contatos-abravely.csv"');
    return res.send(`\uFEFF${rows.join('\r\n')}`);
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível exportar os contatos.' });
  }
});

router.get('/:id/contactable-inboxes', async (req: Request, res: Response) => {
  const contact = await prisma.contact.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
  });
  if (!contact) return res.status(404).json({ message: 'Contato não encontrado.' });
  const channels = await prisma.channel.findMany({
    where: { workspaceId: req.user!.workspaceId, active: true },
    orderBy: { name: 'asc' },
  });
  return res.json({
    payload: channels.map(channel => ({
      source_id: contact.phone || '',
      inbox: {
        id: channel.id,
        name: channel.name,
        channel_type: 'Channel::Whatsapp',
        phone_number: channel.metaPhoneNumberId || channel.evolutionInstanceName || '',
        provider: channel.type,
        medium: channel.type === 'META_CLOUD' ? 'meta' : 'evolution',
      },
    })),
  });
});

router.get('/:id/conversations', async (req: Request, res: Response) => {
  const contact = await prisma.contact.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
  });
  if (!contact) return res.status(404).json({ message: 'Contato não encontrado.' });
  const conversations = await prisma.conversation.findMany({
    where: { contactId: contact.id, workspaceId: req.user!.workspaceId },
    include: { channel: true },
    orderBy: { updatedAt: 'desc' },
  });
  return res.json({
    payload: conversations.map(conversation => ({
      id: conversation.id,
      account_id: 1,
      inbox_id: conversation.channelId,
      status: conversation.status === 'CLOSED' ? 'resolved' : 'open',
      created_at: Math.floor(conversation.createdAt.getTime() / 1000),
      updated_at: Math.floor(conversation.updatedAt.getTime() / 1000),
    })),
  });
});

router.post('/:id/conversations', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!contact || !contact.phone) {
      return res.status(400).json({ message: 'Contato com telefone válido é obrigatório.' });
    }
    const channel = await prisma.channel.findFirst({
      where: { id: String(req.body.inbox_id || ''), workspaceId: req.user!.workspaceId, active: true },
    });
    if (!channel) return res.status(404).json({ message: 'Canal não encontrado.' });

    const message = req.body.message || {};
    const template = message.template_params || {};
    let content = String(message.content || '').trim();

    if (channel.type === 'META_CLOUD') {
      if (!template.name) {
        return res.status(400).json({ message: 'Selecione um template Meta aprovado para iniciar a conversa.' });
      }
      if (!channel.metaPhoneNumberId || !channel.metaToken) {
        return res.status(400).json({ message: 'O canal Meta não possui credenciais válidas.' });
      }
      const bodyParams = Object.values(template.processed_params?.body || {}).map(String);
      await MetaService.sendTemplateMessage(
        channel.metaPhoneNumberId,
        channel.metaToken,
        contact.phone,
        template.name,
        typeof template.language === 'string' ? template.language : template.language?.code || 'pt_BR',
        bodyParams
      );
      content = content || `[Template Meta: ${template.name}]`;
    } else {
      if (!content) return res.status(400).json({ message: 'Digite a primeira mensagem.' });
      if (!channel.evolutionInstanceName) {
        return res.status(400).json({ message: 'A instância Evolution Go não está configurada.' });
      }
      await EvolutionService.sendTextMessage(channel.evolutionInstanceName, contact.phone, content);
    }

    const accountId = Number(req.body.account_id);
    if (!Number.isInteger(accountId) || accountId <= 0) {
      return res.status(400).json({ message: 'Conta inválida para iniciar a conversa.' });
    }

    const conversation = await prisma.conversation.create({
      data: {
        idNumber: `#${Date.now().toString().slice(-8)}`,
        channelId: channel.id,
        contactId: contact.id,
        workspaceId: req.user!.workspaceId,
        agentId: req.user!.id,
        status: 'OPEN',
        queue: 'CONVERSATION',
        unreadCount: 0,
        messages: {
          create: {
            content,
            senderType: 'AGENT',
            senderName: req.user!.name,
            avatarPill: req.user!.name.slice(0, 2).toUpperCase(),
          },
        },
      },
      include: { messages: true },
    });
    emitToWorkspace(req.user!.workspaceId, 'conversation:created', conversation);
    return res.status(201).json({
      ...conversation,
      account_id: accountId,
      inbox_id: channel.id,
    });
  } catch (error: any) {
    return res.status(502).json({ message: error.message || 'Não foi possível iniciar a conversa.' });
  }
});

export default router;
