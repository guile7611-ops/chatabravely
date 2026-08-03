"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_service_1 = require("../services/webhook.service");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/webhooks/evolution (com ou sem :instanceName)
 * Webhook em tempo real da Evolution API GO (QR Code)
 */
router.post('/evolution/:instanceName?', async (req, res) => {
    try {
        const instanceName = req.params.instanceName || req.body?.instance || 'default';
        const result = await webhook_service_1.WebhookService.processEvolutionWebhook(instanceName, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('❌ Erro na rota de Webhook Evolution:', error.message);
        return res.status(200).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/v1/webhooks/whatsapp/meta
 * Handshake e verificacao de token para Webhooks da Meta Cloud API
 */
router.get('/whatsapp/meta', (req, res) => {
    try {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'abravely_verify_token';
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ Handshake do Webhook da Meta aprovado com sucesso!');
            return res.status(200).send(challenge);
        }
        else {
            console.warn('⚠️ Falha de token no Handshake do Webhook da Meta');
            return res.sendStatus(403);
        }
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
/**
 * POST /api/v1/webhooks/whatsapp/meta
 * Recebimento de mensagens e atualizacoes de status da Meta Cloud API
 */
router.post('/whatsapp/meta', async (req, res) => {
    try {
        const result = await webhook_service_1.WebhookService.processMetaWebhook(req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('❌ Erro na rota de Webhook Meta:', error.message);
        return res.status(200).json({ success: false, error: error.message });
    }
});
exports.default = router;
