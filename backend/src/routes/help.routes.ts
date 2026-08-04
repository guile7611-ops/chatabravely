import { HelpArticleStatus, Prisma } from '@prisma/client';
import { Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

const toStatus = (value: unknown): HelpArticleStatus | undefined => {
  if (typeof value !== 'string') return undefined;
  const status = value.toUpperCase();
  return Object.values(HelpArticleStatus).includes(status as HelpArticleStatus)
    ? (status as HelpArticleStatus)
    : undefined;
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const makeCategorySlug = async (workspaceId: string, name: string) => {
  const base = slugify(name) || 'categoria';
  let slug = base;
  let suffix = 2;
  while (
    await prisma.helpCategory.findUnique({
      where: { workspaceId_slug: { workspaceId, slug } },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
};

const articleInclude = {
  category: true,
  author: { select: { id: true, name: true } },
} satisfies Prisma.HelpArticleInclude;

const serializeCategory = (category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  iconColor: string | null;
  position: number;
  _count?: { articles: number };
}) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  icon: category.icon,
  icon_color: category.iconColor,
  position: category.position,
  meta: { articles_count: category._count?.articles ?? 0 },
});

const serializeArticle = (article: Prisma.HelpArticleGetPayload<{
  include: typeof articleInclude;
}>) => ({
  id: article.id,
  title: article.title,
  subject: article.subject,
  content: article.content,
  status: article.status.toLowerCase(),
  position: article.position,
  attachments: Array.isArray(article.attachments) ? article.attachments : [],
  fileUrl: article.fileUrl,
  fileName: article.fileName,
  videoUrl: article.videoUrl,
  views: article.views,
  categoryId: article.categoryId,
  category: article.category ? serializeCategory(article.category) : null,
  author: article.author,
  authorId: article.authorId,
  createdAt: article.createdAt.toISOString(),
  updatedAt: article.updatedAt.toISOString(),
});

const getWorkspaceCategory = async (workspaceId: string, categoryId?: string) => {
  if (!categoryId) return null;
  return prisma.helpCategory.findFirst({ where: { id: categoryId, workspaceId } });
};

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.helpCategory.findMany({
      where: { workspaceId: req.user!.workspaceId },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { articles: true } } },
    });
    return res.json({ categories: categories.map(serializeCategory) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível carregar as categorias.', error: error.message });
  }
});

router.post('/categories', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, icon, icon_color: iconColor } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
    }
    const workspaceId = req.user!.workspaceId;
    const aggregate = await prisma.helpCategory.aggregate({
      where: { workspaceId },
      _max: { position: true },
    });
    const category = await prisma.helpCategory.create({
      data: {
        name: name.trim(),
        slug: await makeCategorySlug(workspaceId, name),
        description: typeof description === 'string' ? description : null,
        icon: typeof icon === 'string' ? icon : null,
        iconColor: typeof iconColor === 'string' ? iconColor : null,
        position: (aggregate._max.position ?? -1) + 1,
        workspaceId,
      },
      include: { _count: { select: { articles: true } } },
    });
    return res.status(201).json({ category: serializeCategory(category) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível criar a categoria.', error: error.message });
  }
});

router.patch('/categories/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const current = await prisma.helpCategory.findFirst({ where: { id: req.params.id, workspaceId } });
    if (!current) return res.status(404).json({ message: 'Categoria não encontrada.' });
    const { name, description, icon, icon_color: iconColor } = req.body;
    const category = await prisma.helpCategory.update({
      where: { id: current.id },
      data: {
        ...(typeof name === 'string' && name.trim() ? { name: name.trim() } : {}),
        ...(typeof description === 'string' ? { description } : {}),
        ...(typeof icon === 'string' ? { icon } : {}),
        ...(typeof iconColor === 'string' ? { iconColor } : {}),
      },
      include: { _count: { select: { articles: true } } },
    });
    return res.json({ category: serializeCategory(category) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível atualizar a categoria.', error: error.message });
  }
});

router.delete('/categories/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const category = await prisma.helpCategory.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });
    await prisma.helpCategory.delete({ where: { id: category.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível excluir a categoria.', error: error.message });
  }
});

router.post('/categories/reorder', requireAdmin, async (req: Request, res: Response) => {
  try {
    const positions = req.body?.positions || req.body?.positions_hash;
    if (!positions || typeof positions !== 'object') {
      return res.status(400).json({ message: 'As posições são obrigatórias.' });
    }
    const workspaceId = req.user!.workspaceId;
    const ids = Object.keys(positions);
    const categories = await prisma.helpCategory.findMany({ where: { id: { in: ids }, workspaceId }, select: { id: true } });
    if (categories.length !== ids.length) return res.status(404).json({ message: 'Uma ou mais categorias não foram encontradas.' });
    await prisma.$transaction(categories.map(category => prisma.helpCategory.update({ where: { id: category.id }, data: { position: Number(positions[category.id]) } })));
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível reordenar as categorias.', error: error.message });
  }
});

router.get('/articles', async (req: Request, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const search = String(req.query.search || req.query.query || '').trim();
    const status = toStatus(req.query.status);
    const categorySlug = typeof req.query.categorySlug === 'string' ? req.query.categorySlug : undefined;
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const authorId = typeof req.query.authorId === 'string' ? req.query.authorId : undefined;
    const where: Prisma.HelpArticleWhereInput = {
      workspaceId,
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(authorId ? { authorId } : {}),
      ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { subject: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] } : {}),
    };
    const articles = await prisma.helpArticle.findMany({
      where,
      include: articleInclude,
      orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
    });
    const allArticlesCount = await prisma.helpArticle.count({ where: { workspaceId } });
    const counts = await prisma.helpArticle.groupBy({ where: { workspaceId }, by: ['status'], _count: true });
    const countFor = (articleStatus: HelpArticleStatus) => counts.find(count => count.status === articleStatus)?._count ?? 0;
    return res.json({
      articles: articles.map(serializeArticle),
      meta: {
        currentPage: 1,
        allArticlesCount,
        articlesCount: countFor(HelpArticleStatus.PUBLISHED),
        mineArticlesCount: countFor(HelpArticleStatus.PUBLISHED),
        draftArticlesCount: countFor(HelpArticleStatus.DRAFT),
        archivedArticlesCount: countFor(HelpArticleStatus.ARCHIVED),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível carregar os artigos.', error: error.message });
  }
});

router.post('/articles', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId, status, attachments, subject } = req.body;
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string') {
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
    }
    const workspaceId = req.user!.workspaceId;
    const category = await getWorkspaceCategory(workspaceId, categoryId);
    if (categoryId && !category) return res.status(400).json({ message: 'Categoria inválida para este workspace.' });
    const aggregate = await prisma.helpArticle.aggregate({ where: { workspaceId }, _max: { position: true } });
    const article = await prisma.helpArticle.create({
      data: {
        title: title.trim(),
        subject: typeof subject === 'string' && subject.trim() ? subject.trim() : title.trim(),
        content,
        status: toStatus(status) ?? HelpArticleStatus.PUBLISHED,
        attachments: Array.isArray(attachments) ? attachments : undefined,
        categoryId: category?.id,
        authorId: req.user!.id,
        workspaceId,
        position: (aggregate._max.position ?? -1) + 1,
      },
      include: articleInclude,
    });
    return res.status(201).json({ article: serializeArticle(article) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível criar o artigo.', error: error.message });
  }
});

router.get('/articles/:id', async (req: Request, res: Response) => {
  try {
    const article = await prisma.helpArticle.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
      include: articleInclude,
    });
    if (!article) return res.status(404).json({ message: 'Artigo não encontrado.' });
    return res.json({ article: serializeArticle(article) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível carregar o artigo.', error: error.message });
  }
});

router.patch('/articles/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const existing = await prisma.helpArticle.findFirst({ where: { id: req.params.id, workspaceId } });
    if (!existing) return res.status(404).json({ message: 'Artigo não encontrado.' });
    const { title, subject, content, categoryId, status, attachments } = req.body;
    const category = await getWorkspaceCategory(workspaceId, categoryId);
    if (categoryId && !category) return res.status(400).json({ message: 'Categoria inválida para este workspace.' });
    const article = await prisma.helpArticle.update({
      where: { id: existing.id },
      data: {
        ...(typeof title === 'string' && title.trim() ? { title: title.trim() } : {}),
        ...(typeof subject === 'string' ? { subject } : {}),
        ...(typeof content === 'string' ? { content } : {}),
        ...(categoryId !== undefined ? { categoryId: category?.id ?? null } : {}),
        ...(toStatus(status) ? { status: toStatus(status) } : {}),
        ...(Array.isArray(attachments) ? { attachments } : {}),
      },
      include: articleInclude,
    });
    return res.json({ article: serializeArticle(article) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível atualizar o artigo.', error: error.message });
  }
});

router.delete('/articles/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const article = await prisma.helpArticle.findFirst({ where: { id: req.params.id, workspaceId: req.user!.workspaceId } });
    if (!article) return res.status(404).json({ message: 'Artigo não encontrado.' });
    await prisma.helpArticle.delete({ where: { id: article.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível excluir o artigo.', error: error.message });
  }
});

router.post('/articles/reorder', requireAdmin, async (req: Request, res: Response) => {
  try {
    const positions = req.body?.positions || req.body?.positions_hash;
    if (!positions || typeof positions !== 'object') return res.status(400).json({ message: 'As posições são obrigatórias.' });
    const ids = Object.keys(positions);
    const workspaceId = req.user!.workspaceId;
    const articles = await prisma.helpArticle.findMany({ where: { id: { in: ids }, workspaceId }, select: { id: true } });
    if (articles.length !== ids.length) return res.status(404).json({ message: 'Um ou mais artigos não foram encontrados.' });
    await prisma.$transaction(articles.map(article => prisma.helpArticle.update({ where: { id: article.id }, data: { position: Number(positions[article.id]) } })));
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: 'Não foi possível reordenar os artigos.', error: error.message });
  }
});

router.patch('/articles/bulk/status', requireAdmin, async (req: Request, res: Response) => {
  const status = toStatus(req.body?.status);
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!status || !ids.length) return res.status(400).json({ message: 'Artigos e status válidos são obrigatórios.' });
  await prisma.helpArticle.updateMany({ where: { id: { in: ids }, workspaceId: req.user!.workspaceId }, data: { status } });
  return res.status(204).send();
});

router.patch('/articles/bulk/category', requireAdmin, async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const category = await getWorkspaceCategory(req.user!.workspaceId, req.body?.categoryId);
  if (!ids.length || !category) return res.status(400).json({ message: 'Artigos e categoria válidos são obrigatórios.' });
  await prisma.helpArticle.updateMany({ where: { id: { in: ids }, workspaceId: req.user!.workspaceId }, data: { categoryId: category.id } });
  return res.status(204).send();
});

router.delete('/articles/bulk', requireAdmin, async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ message: 'Selecione ao menos um artigo.' });
  await prisma.helpArticle.deleteMany({ where: { id: { in: ids }, workspaceId: req.user!.workspaceId } });
  return res.status(204).send();
});

export default router;
