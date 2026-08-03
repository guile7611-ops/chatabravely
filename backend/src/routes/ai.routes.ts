import { Router, Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import { ReportService } from '../services/report.service';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticação JWT em todas as rotas de IA
router.use(authenticateToken);

/**
 * POST /api/v1/ai/summarize/:conversationId
 * Gerar resumo automatizado de conversa usando IA
 */
router.post('/summarize/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const summary = await AiService.summarizeConversation(conversationId);
    return res.json({ success: true, summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/ai/reports/generate
 * Gerar e salvar novo Relatório Executivo de 7, 14 ou 30 dias do Workspace
 */
router.post('/reports/generate', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { days } = req.body;
    const targetDays = days ? parseInt(days, 10) : 7;

    const report = await ReportService.generateExecutiveReport(user.workspaceId, targetDays, user.name);
    return res.json({ success: true, report });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/ai/reports
 * Listar relatórios executivos salvos do Workspace
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const reports = await ReportService.getSavedReports(user.workspaceId);
    return res.json({ success: true, reports });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
