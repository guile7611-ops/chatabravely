"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const prisma_1 = require("../lib/prisma");
const socket_1 = require("../socket/socket");
const ai_service_1 = require("./ai.service");
const account_routes_1 = require("../routes/account.routes");
class WebhookService {
    /**
     * Processar webhook recebido da Evolution API GO (mensagens recebidas e atualizações)
     */
    static async processEvolutionWebhook(instanceName, body) {
        try {
            const event = body.event || body.type;
            // Tratar atualização de conexão da instância
            if (event === 'connection.update') {
                const state = body.data?.state || body.state;
                const status = state === 'open' ? 'CONNECTED' : 'DISCONNECTED';
                await prisma_1.prisma.channel.updateMany({
                    where: { evolutionInstanceName: instanceName },
                    data: { connectionStatus: status }
                });
                console.log(`📡 [WebhookService] Instância ${instanceName} atualizada para status: ${status}`);
                return { success: true, event: 'connection.update' };
            }
            // Tratar recebimento de novas mensagens
            if (event === 'messages.upsert' || event === 'SEND_MESSAGE' || body.data || body.message) {
                const msgData = body.data || body;
                const key = msgData.key || body.key || (msgData.message && msgData.message.key) || {};
                const isFromMe = key.fromMe === true;
                const remoteJid = key.remoteJid || msgData.remoteJid || body.remoteJid || '';
                if (!remoteJid || remoteJid.includes('@g.us')) {
                    if (!remoteJid)
                        return { success: false, reason: 'missing_jid' };
                }
                const phone = '+' + remoteJid.replace(/\D/g, '');
                const pushName = msgData.pushName || body.sender?.name || 'Cliente WhatsApp';
                let textContent = '';
                let contentType = 'TEXT';
                let mediaUrl = undefined;
                if (msgData.message?.conversation) {
                    textContent = msgData.message.conversation;
                }
                else if (msgData.message?.extendedTextMessage?.text) {
                    textContent = msgData.message.extendedTextMessage.text;
                }
                else if (msgData.message?.imageMessage) {
                    contentType = 'IMAGE';
                    textContent = msgData.message.imageMessage.caption || '📷 [Imagem]';
                    mediaUrl = msgData.message.imageMessage.url;
                }
                else if (msgData.message?.audioMessage) {
                    contentType = 'AUDIO';
                    textContent = '🎵 [Áudio do WhatsApp]';
                    mediaUrl = msgData.message.audioMessage.url;
                }
                else if (typeof msgData.text === 'string') {
                    textContent = msgData.text;
                }
                if (!textContent && contentType === 'TEXT') {
                    textContent = 'Mensagem recebida do WhatsApp';
                }
                // 1. Buscar o Canal associado
                const channel = await prisma_1.prisma.channel.findFirst({
                    where: { evolutionInstanceName: instanceName }
                });
                if (!channel) {
                    console.warn(`⚠️ [WebhookService] Nenhum canal encontrado para a instância ${instanceName}`);
                    return { success: false, reason: 'channel_not_found' };
                }
                // 2. Buscar ou criar o Contato
                let contact = await prisma_1.prisma.contact.findFirst({
                    where: { workspaceId: channel.workspaceId, phone: phone }
                });
                if (!contact) {
                    contact = await prisma_1.prisma.contact.create({
                        data: { name: pushName, phone: phone, workspaceId: channel.workspaceId }
                    });
                }
                // 3. Buscar ou criar a Conversa (Padronizado por workspaceId + channelId + contactId)
                let isNewConversation = false;
                let conversation = await prisma_1.prisma.conversation.findFirst({
                    where: {
                        workspaceId: channel.workspaceId,
                        channelId: channel.id,
                        contactId: contact.id,
                        queue: { in: ['RECEPTION', 'DEPARTMENT', 'CONVERSATION'] }
                    }
                });
                if (!conversation) {
                    isNewConversation = true;
                    conversation = await prisma_1.prisma.conversation.create({
                        data: {
                            idNumber: `#${Math.floor(100 + Math.random() * 900)}`,
                            queue: 'RECEPTION',
                            status: 'UNATTENDED',
                            priority: 'Nenhuma',
                            assignedTeam: 'Sem departamento',
                            slaTimer: '1h 00m',
                            unreadCount: 1,
                            workspaceId: channel.workspaceId,
                            channelId: channel.id,
                            contactId: contact.id,
                            agentId: null,
                            departmentId: null
                        }
                    });
                    await prisma_1.prisma.activityLog.create({
                        data: {
                            conversationId: conversation.id,
                            userName: 'Sistema',
                            action: `📥 Nova mensagem recebida via WhatsApp (${channel.name}) - Entrada na Recepção`
                        }
                    });
                    (0, socket_1.emitToWorkspace)(channel.workspaceId, 'conversation:created', {
                        conversationId: conversation.id,
                        conversation: conversation
                    });
                }
                else {
                    if (conversation.queue === 'CLOSED' || conversation.status === 'CLOSED') {
                        conversation = await prisma_1.prisma.conversation.update({
                            where: { id: conversation.id },
                            data: {
                                queue: 'RECEPTION',
                                status: 'UNATTENDED',
                                agentId: null,
                                departmentId: null,
                                unreadCount: { increment: 1 },
                                updatedAt: new Date()
                            }
                        });
                        await prisma_1.prisma.activityLog.create({
                            data: {
                                conversationId: conversation.id,
                                userName: 'Sistema',
                                action: '🔔 Mensagem do cliente reabriu a conversa para a Recepção'
                            }
                        });
                    }
                    else if (!isFromMe) {
                        conversation = await prisma_1.prisma.conversation.update({
                            where: { id: conversation.id },
                            data: {
                                unreadCount: { increment: 1 },
                                updatedAt: new Date()
                            }
                        });
                    }
                }
                // 4. Salvar mensagem do cliente no banco
                const senderType = isFromMe ? 'AGENT' : 'CUSTOMER';
                const senderName = isFromMe ? 'Atendente' : contact.name;
                const newMessage = await prisma_1.prisma.message.create({
                    data: {
                        externalId: key.id || undefined,
                        conversationId: conversation.id,
                        content: textContent,
                        contentType: contentType,
                        senderType: senderType,
                        senderName: senderName,
                        mediaUrl: mediaUrl,
                        isPrivate: false
                    }
                });
                // 5. Emitir eventos WebSocket padronizados (NUNCA usar conversation:update)
                (0, socket_1.emitToWorkspace)(channel.workspaceId, 'message:new', {
                    message: newMessage,
                    conversationId: conversation.id
                });
                (0, socket_1.emitToWorkspace)(channel.workspaceId, 'conversation:updated', {
                    conversationId: conversation.id,
                    conversation: conversation
                });
                // 6. Se for mensagem recebida do cliente na fila RECEPTION e sem atendente -> Disparar IA de Recepção
                if (!isFromMe && conversation.queue === 'RECEPTION' && conversation.agentId === null) {
                    ai_service_1.AiService.handleAiAutoResponse(conversation.id, textContent).catch(err => {
                        console.error('❌ Erro no disparo assíncrono da IA na Recepção:', err);
                    });
                }
                return { success: true, messageId: newMessage.id };
            }
            return { success: true, event: 'unhandled_event' };
        }
        catch (error) {
            console.error('❌ [WebhookService] Erro ao processar webhook Evolution API:', error);
            throw error;
        }
    }
    /**
     * Processar webhook da WhatsApp Meta Cloud API Oficial (Padronizado com Evolution)
     */
    static async processMetaWebhook(body) {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            if (value?.messages?.[0]) {
                const msg = value.messages[0];
                const contactInfo = value.contacts?.[0];
                const phoneNumberId = value.metadata?.phone_number_id;
                const phone = '+' + msg.from.replace(/\D/g, '');
                const pushName = contactInfo?.profile?.name || 'Cliente WhatsApp Meta';
                // 1. Localizar canal Meta por Phone Number ID (com busca flexível e fallback por workspace)
                const displayPhoneNumber = value.metadata?.display_phone_number;
                const cleanDisplay = displayPhoneNumber ? displayPhoneNumber.replace(/\D/g, '') : '';
                let channel = null;
                try {
                    channel = await prisma_1.prisma.channel.findFirst({
                        where: {
                            OR: [
                                { metaPhoneNumberId: phoneNumberId },
                                ...(cleanDisplay ? [{ metaPhoneNumberId: cleanDisplay }] : []),
                                ...(displayPhoneNumber ? [{ metaPhoneNumberId: displayPhoneNumber }] : [])
                            ]
                        }
                    });
                    if (!channel) {
                        let workspace = await prisma_1.prisma.workspace.findFirst();
                        if (!workspace) {
                            workspace = await prisma_1.prisma.workspace.create({
                                data: { name: 'Workspace Principal' }
                            });
                        }
                        channel = await prisma_1.prisma.channel.create({
                            data: {
                                name: displayPhoneNumber ? `WhatsApp ${displayPhoneNumber}` : 'WhatsApp Meta Cloud API (Oficial)',
                                type: 'META_CLOUD',
                                connectionStatus: 'CONNECTED',
                                metaPhoneNumberId: phoneNumberId || 'default',
                                workspaceId: workspace.id
                            }
                        });
                        console.log(`✨ [WebhookService] Canal Meta Cloud API criado automaticamente: ${channel.id}`);
                    }
                }
                catch (dbErr) {
                    channel = {
                        id: 'channel_meta_cloud_1',
                        name: displayPhoneNumber ? `WhatsApp ${displayPhoneNumber}` : 'WhatsApp Meta Cloud API (Oficial)',
                        type: 'META_CLOUD',
                        connectionStatus: 'CONNECTED',
                        workspaceId: 'default_workspace_id'
                    };
                }
                let textContent = msg.text?.body || 'Mensagem oficial da Meta';
                let contentType = 'TEXT';
                let mediaUrl = undefined;
                if (msg.type === 'image') {
                    contentType = 'IMAGE';
                    textContent = msg.image?.caption || '📷 [Imagem WhatsApp Oficial]';
                }
                else if (msg.type === 'audio') {
                    contentType = 'AUDIO';
                    textContent = '🎵 [Áudio WhatsApp Oficial]';
                }
                // 2. Buscar ou criar Contato com resiliência
                let contact = null;
                try {
                    contact = await prisma_1.prisma.contact.findFirst({
                        where: { workspaceId: channel.workspaceId, phone: phone }
                    });
                    if (!contact) {
                        contact = await prisma_1.prisma.contact.create({
                            data: { name: pushName, phone: phone, workspaceId: channel.workspaceId }
                        });
                    }
                }
                catch (dbErr) {
                    contact = {
                        id: `contact_${phone.replace(/\D/g, '')}`,
                        name: pushName,
                        phone: phone
                    };
                }
                // 3. Buscar ou criar Conversa (Obrigatório cair na fila RECEPTION se não houver atendente atribuído)
                let isNewConversation = false;
                let conversation = null;
                try {
                    conversation = await prisma_1.prisma.conversation.findFirst({
                        where: {
                            workspaceId: channel.workspaceId,
                            channelId: channel.id,
                            contactId: contact.id
                        }
                    });
                    if (!conversation) {
                        isNewConversation = true;
                        conversation = await prisma_1.prisma.conversation.create({
                            data: {
                                idNumber: `#${Math.floor(100 + Math.random() * 900)}`,
                                queue: 'RECEPTION',
                                status: 'UNATTENDED',
                                priority: 'Nenhuma',
                                assignedTeam: 'Sem departamento',
                                slaTimer: '1h 00m',
                                unreadCount: 1,
                                workspaceId: channel.workspaceId,
                                channelId: channel.id,
                                contactId: contact.id,
                                agentId: null,
                                departmentId: null
                            }
                        });
                        await prisma_1.prisma.activityLog.create({
                            data: {
                                conversationId: conversation.id,
                                userName: 'Sistema',
                                action: `📥 Nova mensagem recebida via WhatsApp Meta (${channel.name}) - Entrada na Recepção`
                            }
                        }).catch(() => { });
                    }
                    else {
                        const forceReception = conversation.agentId === null || conversation.queue === 'CLOSED' || conversation.status === 'CLOSED';
                        conversation = await prisma_1.prisma.conversation.update({
                            where: { id: conversation.id },
                            data: {
                                queue: forceReception ? 'RECEPTION' : conversation.queue,
                                status: forceReception ? 'UNATTENDED' : conversation.status,
                                unreadCount: { increment: 1 },
                                updatedAt: new Date()
                            }
                        });
                    }
                }
                catch (dbErr) {
                    conversation = {
                        id: `conv_${phone.replace(/\D/g, '')}`,
                        queue: 'RECEPTION',
                        status: 'UNATTENDED',
                        unreadCount: 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        agentId: null,
                        workspaceId: channel.workspaceId,
                        channelId: channel.id,
                        contactId: contact.id
                    };
                }
                // 4. Salvar Mensagem do Cliente
                let newMessage = null;
                try {
                    newMessage = await prisma_1.prisma.message.create({
                        data: {
                            externalId: msg.id,
                            conversationId: conversation.id,
                            content: textContent,
                            contentType: contentType,
                            senderType: 'CUSTOMER',
                            senderName: contact.name,
                            mediaUrl: mediaUrl
                        }
                    });
                }
                catch (e) {
                    newMessage = {
                        id: msg.id || `msg_${Date.now()}`,
                        content: textContent,
                        contentType: contentType,
                        senderType: 'CUSTOMER',
                        senderName: contact.name,
                        mediaUrl: mediaUrl,
                        createdAt: new Date(),
                        isPrivate: false
                    };
                }
                // Sincronizar conversa com inMemoryConversations para resiliência local/offline
                const memConv = {
                    id: conversation.id,
                    channelId: channel.id || 1,
                    status: 'UNATTENDED',
                    queue: 'RECEPTION',
                    agentId: null,
                    unreadCount: (conversation.unreadCount || 0) + 1,
                    createdAt: conversation.createdAt || new Date(),
                    updatedAt: new Date(),
                    contact,
                    channel,
                    messages: [newMessage]
                };
                const existingMemIdx = account_routes_1.inMemoryConversations.findIndex((c) => c.id === conversation.id);
                if (existingMemIdx >= 0) {
                    account_routes_1.inMemoryConversations[existingMemIdx] = memConv;
                }
                else {
                    account_routes_1.inMemoryConversations.unshift(memConv);
                }
                // 5. Emitir eventos WebSocket no formato ActionCable (com notação de ponto) para atualização em tempo real do frontend
                const nowSec = Math.floor(Date.now() / 1000);
                const isUnattended = conversation.status === 'UNATTENDED' || conversation.queue === 'RECEPTION' || conversation.queue === 'DEPARTMENT' || !conversation.agentId;
                const statusString = conversation.status === 'CLOSED' || conversation.queue === 'CLOSED' ? 'resolved' : (isUnattended ? 'pending' : 'open');
                const formattedMsg = {
                    id: newMessage.id,
                    content: newMessage.content,
                    account_id: 1,
                    inbox_id: channel?.id || 1,
                    conversation_id: conversation.id,
                    message_type: newMessage.senderType === 'CUSTOMER' ? 0 : 1,
                    created_at: nowSec,
                    updated_at: nowSec,
                    private: newMessage.isPrivate || false,
                    status: 'sent',
                    sender: {
                        id: contact?.id || 1,
                        name: newMessage.senderName || contact?.name || 'Cliente WhatsApp',
                        type: 'contact'
                    },
                    conversation: {
                        id: conversation.id,
                        last_activity_at: nowSec
                    }
                };
                const formattedConv = {
                    id: conversation.id,
                    account_id: 1,
                    uuid: conversation.id,
                    additional_attributes: {},
                    agent_last_seen_at: 0,
                    assignee_last_seen_at: 0,
                    can_reply: true,
                    created_at: Math.floor(new Date(conversation.createdAt || Date.now()).getTime() / 1000),
                    custom_attributes: {},
                    inbox_id: channel?.id || 1,
                    labels: [],
                    muted: false,
                    snoozed_until: null,
                    status: statusString,
                    createdAt: Math.floor(new Date(conversation.createdAt || Date.now()).getTime() / 1000),
                    timestamp: nowSec,
                    unread_count: conversation.unreadCount || 1,
                    meta: {
                        sender: {
                            id: contact?.id || 1,
                            name: contact?.name || 'Cliente WhatsApp',
                            avatar_url: '',
                            type: 'contact',
                            phone_number: contact?.phone || ''
                        },
                        assignee: null,
                        team: null,
                        hmac_verified: false
                    },
                    messages: [formattedMsg]
                };
                if (isNewConversation) {
                    (0, socket_1.emitToWorkspace)(channel.workspaceId, 'conversation.created', formattedConv);
                }
                else {
                    (0, socket_1.emitToWorkspace)(channel.workspaceId, 'conversation.updated', formattedConv);
                }
                (0, socket_1.emitToWorkspace)(channel.workspaceId, 'message.created', formattedMsg);
                // Eventos legados
                (0, socket_1.emitToWorkspace)(channel.workspaceId, 'message:new', {
                    message: newMessage,
                    conversationId: conversation.id
                });
                (0, socket_1.emitToWorkspace)(channel.workspaceId, 'conversation:updated', {
                    conversationId: conversation.id,
                    conversation: conversation
                });
                // 6. Se a conversa estiver na fila RECEPTION e sem atendente -> Disparar IA da Recepção
                if (conversation.queue === 'RECEPTION' && conversation.agentId === null) {
                    ai_service_1.AiService.handleAiAutoResponse(conversation.id, textContent).catch(err => {
                        console.error('❌ Erro no disparo assíncrono da IA Meta na Recepção:', err);
                    });
                }
                console.log(`📥 [WebhookService] Mensagem Meta processada com sucesso ID ${newMessage.id}`);
                return { success: true, messageId: newMessage.id };
            }
            return { success: true };
        }
        catch (error) {
            console.error('❌ [WebhookService] Erro ao processar webhook Meta Cloud API:', error);
            throw error;
        }
    }
}
exports.WebhookService = WebhookService;
