"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_service_1 = require("../services/ai.service");
const report_service_1 = require("../services/report.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticação JWT em todas as rotas de IA
router.use(auth_middleware_1.authenticateToken);
/**
 * POST /api/v1/ai/summarize/:conversationId
 * Gerar resumo automatizado de conversa usando IA
 */
router.post('/summarize/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const summary = await ai_service_1.AiService.summarizeConversation(conversationId);
        return res.json({ success: true, summary });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/v1/ai/reports/generate
 * Gerar e salvar novo Relatório Executivo de 7, 14 ou 30 dias do Workspace
 */
router.post('/reports/generate', async (req, res) => {
    try {
        const user = req.user;
        const { days } = req.body;
        const targetDays = days ? parseInt(days, 10) : 7;
        const report = await report_service_1.ReportService.generateExecutiveReport(user.workspaceId, targetDays, user.name);
        return res.json({ success: true, report });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/v1/ai/reports
 * Listar relatórios executivos salvos do Workspace
 */
router.get('/reports', async (req, res) => {
    try {
        const user = req.user;
        const reports = await report_service_1.ReportService.getSavedReports(user.workspaceId);
        return res.json({ success: true, reports });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
