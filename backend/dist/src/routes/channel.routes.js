"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const evolution_service_1 = require("../services/evolution.service");
const meta_service_1 = require("../services/meta.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticação JWT em todas as rotas de canais
router.use(auth_middleware_1.authenticateToken);
/**
 * GET /api/v1/channels
 * Listar conexões ativas do Workspace do usuário autenticado
 */
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const channels = await prisma_1.prisma.channel.findMany({
            where: { workspaceId: user.workspaceId },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, channels });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/v1/channels/evolution/qr
 * Gerar QR Code base64 e criar/conectar instância no container Evolution API GO
 */
router.post('/evolution/qr', async (req, res) => {
    try {
        const user = req.user;
        const { name, instanceName } = req.body;
        const targetWorkspaceId = user.workspaceId;
        const targetInstanceName = instanceName || `abravely_${Date.now()}`;
        // 1. Tentar criar instância na Evolution GO
        try {
            await evolution_service_1.EvolutionService.createInstance(targetInstanceName);
        }
        catch (e) {
            // Instância já pode existir, continuar para conectar
        }
        // 2. Obter QR Code de conexão
        const qrData = await evolution_service_1.EvolutionService.connectInstance(targetInstanceName);
        const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.code;
        // 3. Salvar ou atualizar canal no PostgreSQL
        let channel = await prisma_1.prisma.channel.findFirst({
            where: { workspaceId: targetWorkspaceId, evolutionInstanceName: targetInstanceName }
        });
        if (!channel) {
            channel = await prisma_1.prisma.channel.create({
                data: {
                    name: name || 'WhatsApp Evolution',
                    type: 'EVOLUTION',
                    connectionStatus: 'CONNECTING',
                    evolutionInstanceName: targetInstanceName,
                    evolutionApiKey: process.env.EVOLUTION_API_KEY || 'EvolutionApiKey123!',
                    qrCodeBase64: qrCodeBase64,
                    workspaceId: targetWorkspaceId
                }
            });
        }
        else {
            channel = await prisma_1.prisma.channel.update({
                where: { id: channel.id },
                data: {
                    connectionStatus: 'CONNECTING',
                    qrCodeBase64: qrCodeBase64,
                    updatedAt: new Date()
                }
            });
        }
        return res.json({
            success: true,
            channelId: channel.id,
            instanceName: targetInstanceName,
            qrCodeBase64: qrCodeBase64,
            connectionStatus: channel.connectionStatus
        });
    }
    catch (error) {
        console.error('❌ Erro na geração de QR Code Evolution:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/v1/channels/meta/save
 * Cadastrar credenciais da Meta Cloud API (Phone Number ID + Permanent Access Token)
 */
router.post('/meta/save', async (req, res) => {
    try {
        const user = req.user;
        const { name, metaPhoneNumberId, metaToken, metaWabaId } = req.body;
        const targetWorkspaceId = user.workspaceId;
        if (!metaPhoneNumberId || !metaToken) {
            return res.status(400).json({ success: false, message: 'metaPhoneNumberId e metaToken são obrigatórios' });
        }
        // Tentar consultar os detalhes do número real na Meta Graph API
        let fetchedDisplayPhone = undefined;
        try {
            const details = await meta_service_1.MetaService.getPhoneNumberDetails(metaPhoneNumberId, metaToken);
            if (details?.display_phone_number) {
                fetchedDisplayPhone = details.display_phone_number;
            }
        }
        catch (e) { }
        const channelName = name || (fetchedDisplayPhone ? `WhatsApp ${fetchedDisplayPhone}` : 'WhatsApp Meta Cloud API');
        const channel = await prisma_1.prisma.channel.create({
            data: {
                name: channelName,
                type: 'META_CLOUD',
                connectionStatus: 'CONNECTED',
                metaPhoneNumberId: metaPhoneNumberId,
                metaToken: metaToken,
                metaWabaId: metaWabaId || null,
                workspaceId: targetWorkspaceId
            }
        });
        return res.json({
            success: true,
            channel: {
                ...channel,
                displayPhone: fetchedDisplayPhone
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/v1/channels/:id/templates
 * Buscar templates de mensagem HSM aprovados na Meta Graph API para a conexão
 */
router.get('/:id/templates', async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const channel = await prisma_1.prisma.channel.findFirst({
            where: { id: id, workspaceId: user.workspaceId }
        });
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal não encontrado.' });
        }
        if (channel.type !== 'META_CLOUD') {
            return res.status(400).json({ success: false, message: 'Este canal não é do tipo Meta Cloud API.' });
        }
        const wabaId = channel.metaWabaId || 'default_waba';
        const metaToken = channel.metaToken || '';
        const templates = await meta_service_1.MetaService.fetchTemplates(wabaId, metaToken);
        return res.json({
            success: true,
            templates
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * DELETE /api/v1/channels/:id
 * Excluir conexão de canal do Workspace do usuário autenticado
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const targetChannel = await prisma_1.prisma.channel.findFirst({
            where: { id: id, workspaceId: user.workspaceId }
        });
        if (!targetChannel) {
            return res.status(404).json({ success: false, message: 'Canal não encontrado no workspace.' });
        }
        await prisma_1.prisma.channel.delete({ where: { id: id } });
        console.log(`🗑️ [ChannelRoutes] Canal de conexão removido: ${id}`);
        return res.json({ success: true, message: 'Conexão excluída com sucesso' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
