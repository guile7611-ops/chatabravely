"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticação JWT em todas as rotas da Central de Ajuda
router.use(auth_middleware_1.authenticateToken);
/**
 * GET /api/v1/help/articles
 * Listar artigos da Central de Ajuda do Workspace
 */
router.get('/articles', async (req, res) => {
    try {
        const user = req.user;
        const search = req.query.search;
        const whereClause = { workspaceId: user.workspaceId };
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } }
            ];
        }
        const articles = await prisma_1.prisma.helpArticle.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, count: articles.length, articles });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/v1/help/articles
 * Criar ou editar artigo na Central de Ajuda (Exclusivo para Gestores - ADMIN)
 */
router.post('/articles', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const user = req.user;
        const { title, subject, content, fileUrl, fileName, videoUrl } = req.body;
        if (!title || !subject || !content) {
            return res.status(400).json({ success: false, message: 'Título, Assunto e Conteúdo são obrigatórios.' });
        }
        const article = await prisma_1.prisma.helpArticle.create({
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
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * DELETE /api/v1/help/articles/:id
 * Excluir artigo da Central de Ajuda (Exclusivo para Gestores - ADMIN)
 */
router.delete('/articles/:id', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const targetArticle = await prisma_1.prisma.helpArticle.findFirst({
            where: { id: id, workspaceId: user.workspaceId }
        });
        if (!targetArticle) {
            return res.status(404).json({ success: false, message: 'Artigo não encontrado no workspace.' });
        }
        await prisma_1.prisma.helpArticle.delete({ where: { id: id } });
        return res.json({ success: true, message: 'Artigo excluído com sucesso' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
