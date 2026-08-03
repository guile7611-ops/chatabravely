import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/v1/departments
 * Listar departamentos do workspace autenticado
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const departments = await prisma.department.findMany({
      where: { workspaceId: user.workspaceId },
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar departamentos:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
