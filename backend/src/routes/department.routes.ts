import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  authenticateToken,
  requireAdmin,
} from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

const serializeMember = (member: any) => ({
  id: member.id,
  name: member.name,
  email: member.email,
  role: member.role === 'ADMIN' ? 'administrator' : 'agent',
  availability_status: member.isOnline ? 'online' : 'offline',
  confirmed: true,
  thumbnail: member.avatarUrl || '',
});

const serializeDepartment = (department: any, currentUserId?: string) => ({
  id: department.id,
  name: department.name,
  description: department.description || '',
  allow_auto_assign: department.allowAutoAssign,
  is_member: department.users?.some((user: any) => user.id === currentUserId),
  members_count: department.users?.length || 0,
  created_at: department.createdAt,
  updated_at: department.updatedAt,
});

const findDepartment = (id: string, workspaceId: string) =>
  prisma.department.findFirst({
    where: { id, workspaceId },
    include: { users: true },
  });

router.get('/', async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { workspaceId: req.user!.workspaceId },
      include: { users: { select: { id: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json({
      success: true,
      data: departments.map(item => serializeDepartment(item, req.user!.id)),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar os departamentos.',
    });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'O nome do departamento é obrigatório.',
      });
    }

    const existing = await prisma.department.findFirst({
      where: { workspaceId: req.user!.workspaceId, name },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um departamento com este nome.',
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description: String(req.body.description || '').trim() || null,
        allowAutoAssign: req.body.allow_auto_assign !== false,
        workspaceId: req.user!.workspaceId,
      },
      include: { users: { select: { id: true } } },
    });
    return res.status(201).json({
      success: true,
      data: serializeDepartment(department, req.user!.id),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível criar o departamento.',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const department = await findDepartment(
      req.params.id,
      req.user!.workspaceId
    );
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado.',
      });
    }
    return res.json({
      success: true,
      data: serializeDepartment(department, req.user!.id),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar o departamento.',
    });
  }
});

router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const current = await findDepartment(
      req.params.id,
      req.user!.workspaceId
    );
    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado.',
      });
    }

    const data: Record<string, unknown> = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'O nome do departamento é obrigatório.',
        });
      }
      data.name = name;
    }
    if (req.body.description !== undefined) {
      data.description = String(req.body.description).trim() || null;
    }
    if (req.body.allow_auto_assign !== undefined) {
      data.allowAutoAssign = Boolean(req.body.allow_auto_assign);
    }

    const department = await prisma.department.update({
      where: { id: current.id },
      data,
      include: { users: { select: { id: true } } },
    });
    return res.json({
      success: true,
      data: serializeDepartment(department, req.user!.id),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível atualizar o departamento.',
    });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const department = await findDepartment(
      req.params.id,
      req.user!.workspaceId
    );
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado.',
      });
    }
    await prisma.department.delete({ where: { id: department.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível remover o departamento.',
    });
  }
});

router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const department = await findDepartment(
      req.params.id,
      req.user!.workspaceId
    );
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado.',
      });
    }
    return res.json({
      success: true,
      data: department.users.map(serializeMember),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar os membros do departamento.',
    });
  }
});

const replaceMembers = async (req: Request, res: Response) => {
  try {
    const department = await findDepartment(
      req.params.id,
      req.user!.workspaceId
    );
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado.',
      });
    }

    const userIds: string[] = Array.isArray(req.body.user_ids)
      ? Array.from(
          new Set<string>(req.body.user_ids.map((value: unknown) => String(value)))
        )
      : [];
    const validUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        workspaceId: req.user!.workspaceId,
      },
    });
    if (validUsers.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Um ou mais atendentes não pertencem a este workspace.',
      });
    }

    const updated = await prisma.department.update({
      where: { id: department.id },
      data: { users: { set: validUsers.map(user => ({ id: user.id })) } },
      include: { users: true },
    });
    return res.json({
      success: true,
      data: updated.users.map(serializeMember),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível atualizar os membros do departamento.',
    });
  }
};

router.post('/:id/members', requireAdmin, replaceMembers);
router.patch('/:id/members', requireAdmin, replaceMembers);

export default router;
