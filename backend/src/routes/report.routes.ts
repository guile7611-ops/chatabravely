import { Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

const PAGE_SIZE = 25;

const asDate = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Finalizações são lidas do snapshot ConversationResolution, e não da tabela
 * mutável de conversas. Assim, reabrir uma conversa não apaga o relatório do
 * atendimento que já foi concluído.
 */
router.get('/finalized', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const from = asDate(req.query.from);
    const to = asDate(req.query.to);
    if (from === null || to === null) {
      return res.status(400).json({ message: 'Período de datas inválido.' });
    }

    const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
    const agentId = typeof req.query.agentId === 'string' ? req.query.agentId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const where = {
      workspaceId: req.user!.workspaceId,
      ...(departmentId ? { departmentId } : {}),
      ...(agentId ? { assignedAgentId: agentId } : {}),
      ...((from || to) ? { closedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(search
        ? {
            OR: [
              { contact: { name: { contains: search, mode: 'insensitive' as const } } },
              { contact: { phone: { contains: search } } },
              { departmentName: { contains: search, mode: 'insensitive' as const } },
              { assignedAgentName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, count] = await prisma.$transaction([
      prisma.conversationResolution.findMany({
        where,
        include: {
          contact: { select: { id: true, name: true, phone: true, company: true } },
          conversation: { select: { id: true, queue: true, status: true } },
        },
        orderBy: { closedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.conversationResolution.count({ where }),
    ]);

    return res.json({
      payload: items.map(item => ({
        id: item.id,
        conversation_id: item.conversationId,
        contact: item.contact,
        department: item.departmentId ? { id: item.departmentId, name: item.departmentName } : null,
        attendant: item.assignedAgentId ? { id: item.assignedAgentId, name: item.assignedAgentName } : null,
        finalized_by: { id: item.closedById, name: item.closedByName },
        reason: item.reason,
        opened_at: item.openedAt.toISOString(),
        first_agent_response_at: item.firstAgentResponseAt?.toISOString() || null,
        finalized_at: item.closedAt.toISOString(),
        conversation_state: item.conversation ? { queue: item.conversation.queue, status: item.conversation.status } : null,
      })),
      meta: {
        count,
        current_page: page,
        has_more: page * PAGE_SIZE < count,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível carregar os atendimentos finalizados.', error: error.message });
  }
});

export default router;
