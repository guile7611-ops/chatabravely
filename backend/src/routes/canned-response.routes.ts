import { Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import {
  authenticateToken,
  requireAdmin,
} from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

const serializeCannedResponse = (response: any) => ({
  id: response.id,
  short_code: response.shortcut,
  content: response.content,
  created_at: response.createdAt,
  updated_at: response.updatedAt,
});

const normalizeShortcut = (value: unknown) => String(value || '').trim();

const validatePayload = (body: Record<string, unknown>) => {
  const shortCode = normalizeShortcut(body.short_code);
  const content = String(body.content || '').trim();

  if (shortCode.length < 2) {
    return { error: 'O atalho deve possuir pelo menos 2 caracteres.' };
  }

  if (!content) {
    return { error: 'O conteúdo da resposta rápida é obrigatório.' };
  }

  return { shortCode, content };
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || req.query.q || '').trim();
    const responses = await prisma.cannedResponse.findMany({
      where: {
        workspaceId: req.user!.workspaceId,
        ...(search
          ? {
              OR: [
                { shortcut: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { shortcut: 'asc' },
    });

    return res.json(responses.map(serializeCannedResponse));
  } catch (error) {
    return res.status(500).json({
      message: 'Não foi possível carregar as respostas prontas.',
    });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload = validatePayload(req.body || {});
    if ('error' in payload) {
      return res.status(400).json({ message: payload.error });
    }

    const existing = await prisma.cannedResponse.findFirst({
      where: {
        workspaceId: req.user!.workspaceId,
        shortcut: { equals: payload.shortCode, mode: 'insensitive' },
      },
    });
    if (existing) {
      return res.status(409).json({
        message: 'Já existe uma resposta pronta com este atalho.',
      });
    }

    const response = await prisma.cannedResponse.create({
      data: {
        shortcut: payload.shortCode,
        content: payload.content,
        workspaceId: req.user!.workspaceId,
      },
    });
    return res.status(201).json(serializeCannedResponse(response));
  } catch (error) {
    return res.status(500).json({
      message: 'Não foi possível criar a resposta pronta.',
    });
  }
});

router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const current = await prisma.cannedResponse.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!current) {
      return res.status(404).json({ message: 'Resposta pronta não encontrada.' });
    }

    const data: { shortcut?: string; content?: string } = {};
    if (req.body.short_code !== undefined) {
      const shortCode = normalizeShortcut(req.body.short_code);
      if (shortCode.length < 2) {
        return res.status(400).json({
          message: 'O atalho deve possuir pelo menos 2 caracteres.',
        });
      }

      const duplicate = await prisma.cannedResponse.findFirst({
        where: {
          workspaceId: req.user!.workspaceId,
          id: { not: current.id },
          shortcut: { equals: shortCode, mode: 'insensitive' },
        },
      });
      if (duplicate) {
        return res.status(409).json({
          message: 'Já existe uma resposta pronta com este atalho.',
        });
      }
      data.shortcut = shortCode;
    }

    if (req.body.content !== undefined) {
      const content = String(req.body.content).trim();
      if (!content) {
        return res.status(400).json({
          message: 'O conteúdo da resposta rápida é obrigatório.',
        });
      }
      data.content = content;
    }

    const response = await prisma.cannedResponse.update({
      where: { id: current.id },
      data,
    });
    return res.json(serializeCannedResponse(response));
  } catch (error) {
    return res.status(500).json({
      message: 'Não foi possível atualizar a resposta pronta.',
    });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const current = await prisma.cannedResponse.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!current) {
      return res.status(404).json({ message: 'Resposta pronta não encontrada.' });
    }

    await prisma.cannedResponse.delete({ where: { id: current.id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: 'Não foi possível excluir a resposta pronta.',
    });
  }
});

export default router;
