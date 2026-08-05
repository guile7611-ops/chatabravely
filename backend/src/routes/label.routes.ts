import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  authenticateToken,
  requireAdmin,
} from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

const serializeLabel = (label: any) => ({
  id: label.id,
  title: label.name,
  color: label.color,
  description: label.description || '',
  show_on_sidebar: label.showOnSidebar,
  created_at: label.createdAt,
  updated_at: label.updatedAt,
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const labels = await prisma.label.findMany({
      where: { workspaceId: req.user!.workspaceId },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, data: labels.map(serializeLabel) });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar as etiquetas.',
    });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const title = String(req.body.title || '').trim().toLowerCase();
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'O nome da etiqueta é obrigatório.',
      });
    }

    const existing = await prisma.label.findFirst({
      where: { workspaceId: req.user!.workspaceId, name: title },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma etiqueta com este nome.',
      });
    }

    const label = await prisma.label.create({
      data: {
        name: title,
        color: String(req.body.color || '#0091ff'),
        description: String(req.body.description || '').trim() || null,
        showOnSidebar: req.body.show_on_sidebar !== false,
        workspaceId: req.user!.workspaceId,
      },
    });
    return res.status(201).json({ success: true, data: serializeLabel(label) });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível criar a etiqueta.',
    });
  }
});

router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.label.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta não encontrada.',
      });
    }

    const data: Record<string, unknown> = {};
    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim().toLowerCase();
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'O nome da etiqueta é obrigatório.',
        });
      }
      data.name = title;
    }
    if (req.body.color !== undefined) data.color = String(req.body.color);
    if (req.body.description !== undefined) {
      data.description = String(req.body.description).trim() || null;
    }
    if (req.body.show_on_sidebar !== undefined) {
      data.showOnSidebar = Boolean(req.body.show_on_sidebar);
    }

    const label = await prisma.label.update({
      where: { id: existing.id },
      data,
    });
    return res.json({ success: true, data: serializeLabel(label) });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível atualizar a etiqueta.',
    });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const label = await prisma.label.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta não encontrada.',
      });
    }
    await prisma.label.delete({ where: { id: label.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível remover a etiqueta.',
    });
  }
});

export default router;
