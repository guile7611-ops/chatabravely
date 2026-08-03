import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticação JWT em todas as rotas da Central de Ajuda
router.use(authenticateToken);

/**
 * GET /api/v1/help/articles
 * Listar artigos da Central de Ajuda do Workspace
 */
router.get('/articles', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const search = req.query.search as string;

    const whereClause: any = { workspaceId: user.workspaceId };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    const articles = await prisma.helpArticle.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, count: articles.length, articles });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/help/articles
 * Criar ou editar artigo na Central de Ajuda (Exclusivo para Gestores - ADMIN)
 */
router.post('/articles', requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { title, subject, content, fileUrl, fileName, videoUrl } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ success: false, message: 'Título, Assunto e Conteúdo são obrigatórios.' });
    }

    const article = await prisma.helpArticle.create({
      data: {
        title,
        subject,
        content,
        fileUrl,
        fileName,
        videoUrl,
        workspaceId: user.workspaceId
      }
    });

    return res.json({ success: true, article });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/v1/help/articles/:id
 * Excluir artigo da Central de Ajuda (Exclusivo para Gestores - ADMIN)
 */
router.delete('/articles/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const targetArticle = await prisma.helpArticle.findFirst({
      where: { id: id, workspaceId: user.workspaceId }
    });

    if (!targetArticle) {
      return res.status(404).json({ success: false, message: 'Artigo não encontrado no workspace.' });
    }

    await prisma.helpArticle.delete({ where: { id: id } });
    return res.json({ success: true, message: 'Artigo excluído com sucesso' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
