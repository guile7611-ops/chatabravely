import { prisma } from '../lib/prisma';
import { MessageContentType, MessageSenderType } from '@prisma/client';
import { emitToWorkspace } from '../socket/socket';
import { AiService } from './ai.service';

export class WebhookService {
  /**
   * Processar webhook recebido da Evolution API GO (mensagens recebidas e atualizações)
   */
  static async processEvolutionWebhook(instanceName: string, body: any) {
    try {
      const event = body.event || body.type;
      
      // Tratar atualização de conexão da instância
      if (event === 'connection.update') {
        const state = body.data?.state || body.state;
        const status = state === 'open' ? 'CONNECTED' : 'DISCONNECTED';
        
        await prisma.channel.updateMany({
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
          if (!remoteJid) return { success: false, reason: 'missing_jid' };
        }

        const phone = '+' + remoteJid.replace(/\D/g, '');
        const pushName = msgData.pushName || body.sender?.name || 'Cliente WhatsApp';

        let textContent = '';
        let contentType: MessageContentType = 'TEXT';
        let mediaUrl: string | undefined = undefined;

        if (msgData.message?.conversation) {
          textContent = msgData.message.conversation;
        } else if (msgData.message?.extendedTextMessage?.text) {
          textContent = msgData.message.extendedTextMessage.text;
        } else if (msgData.message?.imageMessage) {
          contentType = 'IMAGE';
          textContent = msgData.message.imageMessage.caption || '📷 [Imagem]';
          mediaUrl = msgData.message.imageMessage.url;
        } else if (msgData.message?.audioMessage) {
          contentType = 'AUDIO';
          textContent = '🎵 [Áudio do WhatsApp]';
          mediaUrl = msgData.message.audioMessage.url;
        } else if (typeof msgData.text === 'string') {
          textContent = msgData.text;
        }

        if (!textContent && contentType === 'TEXT') {
          textContent = 'Mensagem recebida do WhatsApp';
        }

        // 1. Buscar o Canal associado
        const channel = await prisma.channel.findFirst({
          where: { evolutionInstanceName: instanceName }
        });

        if (!channel) {
          console.warn(`⚠️ [WebhookService] Nenhum canal encontrado para a instância ${instanceName}`);
          return { success: false, reason: 'channel_not_found' };
        }

        // 2. Buscar ou criar o Contato
        let contact = await prisma.contact.findFirst({
          where: { workspaceId: channel.workspaceId, phone: phone }
        });

        if (!contact) {
          contact = await prisma.contact.create({
            data: { name: pushName, phone: phone, workspaceId: channel.workspaceId }
          });
        }

        // 3. Buscar ou criar a Conversa (Padronizado por workspaceId + channelId + contactId)
        let isNewConversation = false;
        let conversation = await prisma.conversation.findFirst({
          where: {
            workspaceId: channel.workspaceId,
            channelId: channel.id,
            contactId: contact.id,
            queue: { in: ['RECEPTION', 'DEPARTMENT', 'CONVERSATION'] }
          }
        });

        if (!conversation) {
          isNewConversation = true;
          conversation = await prisma.conversation.create({
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

          await prisma.activityLog.create({
            data: {
              conversationId: conversation.id,
              userName: 'Sistema',
              action: `📥 Nova mensagem recebida via WhatsApp (${channel.name}) - Entrada na Recepção`
            }
          });

          emitToWorkspace(channel.workspaceId, 'conversation:created', {
            conversationId: conversation.id,
            conversation: conversation
          });
        } else {
          if (conversation.queue === 'CLOSED' || conversation.status === 'CLOSED') {
            conversation = await prisma.conversation.update({
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

            await prisma.activityLog.create({
              data: {
                conversationId: conversation.id,
                userName: 'Sistema',
                action: '🔔 Mensagem do cliente reabriu a conversa para a Recepção'
              }
            });
          } else if (!isFromMe) {
            conversation = await prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                unreadCount: { increment: 1 },
                updatedAt: new Date()
              }
            });
          }
        }

        // 4. Salvar mensagem do cliente no banco
        const senderType: MessageSenderType = isFromMe ? 'AGENT' : 'CUSTOMER';
        const senderName = isFromMe ? 'Atendente' : contact.name;

        const newMessage = await prisma.message.create({
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
        emitToWorkspace(channel.workspaceId, 'message:new', {
          message: newMessage,
          conversationId: conversation.id
        });

        emitToWorkspace(channel.workspaceId, 'conversation:updated', {
          conversationId: conversation.id,
          conversation: conversation
        });

        // 6. Se for mensagem recebida do cliente na fila RECEPTION e sem atendente -> Disparar IA de Recepção
        if (!isFromMe && conversation.queue === 'RECEPTION' && conversation.agentId === null) {
          AiService.handleAiAutoResponse(conversation.id, textContent).catch(err => {
            console.error('❌ Erro no disparo assíncrono da IA na Recepção:', err);
          });
        }

        return { success: true, messageId: newMessage.id };
      }

      return { success: true, event: 'unhandled_event' };
    } catch (error: any) {
      console.error('❌ [WebhookService] Erro ao processar webhook Evolution API:', error);
      throw error;
    }
  }

  /**
   * Processar webhook da WhatsApp Meta Cloud API Oficial (Padronizado com Evolution)
   */
  static async processMetaWebhook(body: any) {
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

        let channel = await prisma.channel.findFirst({
          where: {
            OR: [
              { metaPhoneNumberId: phoneNumberId },
              ...(cleanDisplay ? [{ metaPhoneNumberId: cleanDisplay }] : []),
              ...(displayPhoneNumber ? [{ metaPhoneNumberId: displayPhoneNumber }] : [])
            ]
          }
        });

        if (!channel) {
          channel = await prisma.channel.findFirst({
            where: { type: 'META_CLOUD' }
          });
        }

        if (!channel) {
          console.warn(`⚠️ [WebhookService] Nenhum canal Meta encontrado no banco de dados.`);
          return { success: false, reason: 'channel_not_found' };
        }

        let textContent = msg.text?.body || 'Mensagem oficial da Meta';
        let contentType: MessageContentType = 'TEXT';
        let mediaUrl: string | undefined = undefined;

        if (msg.type === 'image') {
          contentType = 'IMAGE';
          textContent = msg.image?.caption || '📷 [Imagem WhatsApp Oficial]';
        } else if (msg.type === 'audio') {
          contentType = 'AUDIO';
          textContent = '🎵 [Áudio WhatsApp Oficial]';
        }

        // 2. Buscar ou criar Contato
        let contact = await prisma.contact.findFirst({
          where: { workspaceId: channel.workspaceId, phone: phone }
        });

        if (!contact) {
          contact = await prisma.contact.create({
            data: { name: pushName, phone: phone, workspaceId: channel.workspaceId }
          });
        }

        // 3. Buscar ou criar Conversa (Padronizado por workspaceId + channelId + contactId na fila RECEPTION)
        let isNewConversation = false;
        let conversation = await prisma.conversation.findFirst({
          where: {
            workspaceId: channel.workspaceId,
            channelId: channel.id,
            contactId: contact.id,
            queue: { in: ['RECEPTION', 'DEPARTMENT', 'CONVERSATION'] }
          }
        });

        if (!conversation) {
          isNewConversation = true;
          conversation = await prisma.conversation.create({
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

          await prisma.activityLog.create({
            data: {
              conversationId: conversation.id,
              userName: 'Sistema',
              action: `📥 Nova mensagem recebida via WhatsApp Meta (${channel.name}) - Entrada na Recepção`
            }
          });

          emitToWorkspace(channel.workspaceId, 'conversation:created', {
            conversationId: conversation.id,
            conversation: conversation
          });
        } else {
          if (conversation.queue === 'CLOSED' || conversation.status === 'CLOSED') {
            conversation = await prisma.conversation.update({
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

            await prisma.activityLog.create({
              data: {
                conversationId: conversation.id,
                userName: 'Sistema',
                action: '🔔 Mensagem do cliente reabriu a conversa para a Recepção'
              }
            });
          } else {
            conversation = await prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                unreadCount: { increment: 1 },
                updatedAt: new Date()
              }
            });
          }
        }

        // 4. Salvar Mensagem do Cliente
        const newMessage = await prisma.message.create({
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

        // 5. Emitir eventos WebSocket padronizados (NUNCA usar conversation:update)
        emitToWorkspace(channel.workspaceId, 'message:new', {
          message: newMessage,
          conversationId: conversation.id
        });

        emitToWorkspace(channel.workspaceId, 'conversation:updated', {
          conversationId: conversation.id,
          conversation: conversation
        });

        // 6. Se a conversa estiver na fila RECEPTION e sem atendente -> Disparar IA da Recepção
        if (conversation.queue === 'RECEPTION' && conversation.agentId === null) {
          AiService.handleAiAutoResponse(conversation.id, textContent).catch(err => {
            console.error('❌ Erro no disparo assíncrono da IA Meta na Recepção:', err);
          });
        }

        console.log(`📥 [WebhookService] Mensagem Meta processada com sucesso ID ${newMessage.id}`);
        return { success: true, messageId: newMessage.id };
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ [WebhookService] Erro ao processar webhook Meta Cloud API:', error);
      throw error;
    }
  }
}
