import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EvolutionService } from '../services/evolution.service';
import { MetaService } from '../services/meta.service';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticação JWT em todas as rotas de canais
router.use(authenticateToken);

/**
 * GET /api/v1/channels
 * Listar conexões ativas do Workspace do usuário autenticado
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const channels = await prisma.channel.findMany({
      where: { workspaceId: user.workspaceId, active: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, channels });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const channel = await prisma.channel.findFirst({
      where: {
        id: req.params.id,
        workspaceId: req.user!.workspaceId,
        active: true,
      },
    });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Canal não encontrado.' });
    }
    return res.json({ success: true, channel });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Não foi possível consultar o canal.' });
  }
});

/**
 * POST /api/v1/channels/evolution/qr
 * Gerar QR Code base64 e criar/conectar instância no container Evolution API GO
 */
router.post('/evolution/qr', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, instanceName } = req.body;
    const targetWorkspaceId = user.workspaceId;
    const targetInstanceName = instanceName || `abravely_${Date.now()}`;

    // 1. Tentar criar instância na Evolution GO
    try {
      await EvolutionService.createInstance(targetInstanceName);
    } catch (e) {
      // Instância já pode existir, continuar para conectar
    }

    // 2. Obter QR Code de conexão
    const qrData = await EvolutionService.connectInstance(targetInstanceName);
    const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.code;

    // 3. Salvar ou atualizar canal no PostgreSQL
    let channel = await prisma.channel.findFirst({
      where: { workspaceId: targetWorkspaceId, evolutionInstanceName: targetInstanceName }
    });

    if (!channel) {
      channel = await prisma.channel.create({
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
    } else {
      channel = await prisma.channel.update({
        where: { id: channel.id },
        data: {
          active: true,
          deletedAt: null,
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
  } catch (error: any) {
    console.error('❌ Erro na geração de QR Code Evolution:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/channels/meta/save
 * Cadastrar credenciais da Meta Cloud API (Phone Number ID + Permanent Access Token)
 */
router.post('/meta/save', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, metaPhoneNumberId, metaToken, metaWabaId } = req.body;
    const targetWorkspaceId = user.workspaceId;

    if (!metaPhoneNumberId || !metaToken) {
      return res.status(400).json({ success: false, message: 'metaPhoneNumberId e metaToken são obrigatórios' });
    }

    // A conexão só pode ser persistida depois que a Meta confirmar que o
    // Phone Number ID pertence ao token informado.
    const details = await MetaService.getPhoneNumberDetails(
      metaPhoneNumberId,
      metaToken
    );
    if (!details?.id) {
      return res.status(400).json({
        success: false,
        message:
          'Não foi possível validar o Phone Number ID e o token na Meta. Confira as credenciais e tente novamente.',
      });
    }

    const fetchedDisplayPhone: string | undefined =
      details.display_phone_number;

    const channelName = name || (fetchedDisplayPhone ? `WhatsApp ${fetchedDisplayPhone}` : 'WhatsApp Meta Cloud API');

    const channel = await prisma.channel.create({
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
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/channels/:id/templates
 * Buscar templates de mensagem HSM aprovados na Meta Graph API para a conexão
 */
router.get('/:id/templates', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const channel = await prisma.channel.findFirst({
      where: { id: id, workspaceId: user.workspaceId, active: true }
    });

    if (!channel) {
      return res.status(404).json({ success: false, message: 'Canal não encontrado.' });
    }

    if (channel.type !== 'META_CLOUD') {
      return res.status(400).json({ success: false, message: 'Este canal não é do tipo Meta Cloud API.' });
    }

    const wabaId = channel.metaWabaId;
    const metaToken = channel.metaToken;

    if (!wabaId || !metaToken) {
      return res.status(400).json({ success: false, message: 'WABA ID e token Meta são obrigatórios para buscar templates.' });
    }

    const templates = await MetaService.fetchTemplates(wabaId, metaToken);

    return res.json({
      success: true,
      templates
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/v1/channels/:id
 * Excluir conexão de canal do Workspace do usuário autenticado
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const targetChannel = await prisma.channel.findFirst({
      where: { id: id, workspaceId: user.workspaceId, active: true }
    });

    if (!targetChannel) {
      return res.status(404).json({ success: false, message: 'Canal não encontrado no workspace.' });
    }

    await prisma.channel.update({
      where: { id },
      data: {
        active: false,
        deletedAt: new Date(),
        connectionStatus: 'DISCONNECTED',
        metaToken: null,
        evolutionApiKey: null,
        qrCodeBase64: null,
      },
    });

    // A remoção local não pode depender da disponibilidade da Evolution API.
    // Depois de persistir o canal como inativo, tentamos encerrar a instância
    // externa sem reverter a exclusão caso esse serviço esteja indisponível.
    if (
      targetChannel.type === 'EVOLUTION' &&
      targetChannel.evolutionInstanceName
    ) {
      try {
        await EvolutionService.logoutInstance(
          targetChannel.evolutionInstanceName
        );
      } catch (logoutError: any) {
        console.warn(
          `[ChannelRoutes] Canal ${id} removido localmente, mas a instância Evolution não respondeu: ${logoutError.message}`
        );
      }
    }

    console.log(`🗑️ [ChannelRoutes] Canal de conexão removido: ${id}`);
    return res.json({ success: true, message: 'Conexão excluída com sucesso' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
