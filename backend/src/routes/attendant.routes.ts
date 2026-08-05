import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import {
  authenticateToken,
  requireAdmin,
} from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

const serializeAttendant = (attendant: any) => ({
  id: attendant.id,
  name: attendant.name,
  email: attendant.email,
  role: attendant.role === 'ADMIN' ? 'administrator' : 'agent',
  availability_status: attendant.isOnline ? 'online' : 'offline',
  confirmed: true,
  thumbnail: attendant.avatarUrl || '',
  avatar_url: attendant.avatarUrl || '',
  department_ids: attendant.departments?.map((item: any) => item.id) || [],
  created_at: attendant.createdAt,
  updated_at: attendant.updatedAt,
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const attendants = await prisma.user.findMany({
      where: { workspaceId: req.user!.workspaceId },
      include: { departments: { select: { id: true } } },
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      data: attendants.map(serializeAttendant),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar os atendentes.',
    });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'agent' } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!String(name || '').trim() || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e senha inicial são obrigatórios.',
      });
    }
    if (!normalizedEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Informe um e-mail válido.',
      });
    }
    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'A senha inicial deve possuir pelo menos 8 caracteres.',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Este e-mail já está cadastrado.',
      });
    }

    const attendant = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(String(password), 10),
        role: role === 'administrator' || role === 'ADMIN' ? 'ADMIN' : 'AGENT',
        workspaceId: req.user!.workspaceId,
        isOnline: true,
      },
      include: { departments: { select: { id: true } } },
    });

    return res.status(201).json({
      success: true,
      data: serializeAttendant(attendant),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível criar o atendente.',
    });
  }
});

router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const current = await prisma.user.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Atendente não encontrado.',
      });
    }

    const data: Record<string, unknown> = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'O nome do atendente é obrigatório.',
        });
      }
      data.name = name;
    }
    if (req.body.role !== undefined) {
      data.role =
        req.body.role === 'administrator' || req.body.role === 'ADMIN'
          ? 'ADMIN'
          : 'AGENT';
    }
    if (req.body.availability !== undefined) {
      data.isOnline = req.body.availability === 'online';
    }

    const attendant = await prisma.user.update({
      where: { id: current.id },
      data,
      include: { departments: { select: { id: true } } },
    });

    return res.json({
      success: true,
      data: serializeAttendant(attendant),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível atualizar o atendente.',
    });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(409).json({
        success: false,
        message: 'Você não pode remover o próprio acesso.',
      });
    }

    const attendant = await prisma.user.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!attendant) {
      return res.status(404).json({
        success: false,
        message: 'Atendente não encontrado.',
      });
    }

    await prisma.user.delete({ where: { id: attendant.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível remover o atendente.',
    });
  }
});

export default router;
