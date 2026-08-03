import { Router, Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

const router = Router();

/**
 * POST /api/v1/webhooks/evolution (com ou sem :instanceName)
 * Webhook em tempo real da Evolution API GO (QR Code)
 */
router.post('/evolution/:instanceName?', async (req: Request, res: Response) => {
  try {
    const instanceName = req.params.instanceName || req.body?.instance || 'default';
    const result = await WebhookService.processEvolutionWebhook(instanceName, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Erro na rota de Webhook Evolution:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/webhooks/whatsapp/meta
 * Handshake e verificacao de token para Webhooks da Meta Cloud API
 */
router.get('/whatsapp/meta', (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'abravely_verify_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Handshake do Webhook da Meta aprovado com sucesso!');
      return res.status(200).send(challenge);
    } else {
      console.warn('⚠️ Falha de token no Handshake do Webhook da Meta');
      return res.sendStatus(403);
    }
  } catch (error: any) {
    return res.sendStatus(500);
  }
});

/**
 * POST /api/v1/webhooks/whatsapp/meta
 * Recebimento de mensagens e atualizacoes de status da Meta Cloud API
 */
router.post('/whatsapp/meta', async (req: Request, res: Response) => {
  try {
    console.log('📩 [Webhook Meta] POST recebido:', JSON.stringify(req.body));
    const result = await WebhookService.processMetaWebhook(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Erro na rota de Webhook Meta:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

export default router;
