import { prisma } from '../lib/prisma';
import { MessageContentType, MessageSenderType } from '@prisma/client';
import { emitToWorkspace } from '../socket/socket';

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
          where: { evolutionInstanceName: instanceName, active: true },
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
          where: { evolutionInstanceName: instanceName, active: true }
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
              idNumber: `#${Date.now().toString().slice(-8)}`,
              queue: 'RECEPTION',
              status: 'UNATTENDED',
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

        // 1. Localizar o canal Meta previamente configurado.
        const displayPhoneNumber = value.metadata?.display_phone_number;
        const cleanDisplay = displayPhoneNumber ? displayPhoneNumber.replace(/\D/g, '') : '';

        let channel: any = null;
        try {
          channel = await prisma.channel.findFirst({
            where: {
              OR: [
                { metaPhoneNumberId: phoneNumberId },
                ...(cleanDisplay ? [{ metaPhoneNumberId: cleanDisplay }] : []),
                ...(displayPhoneNumber ? [{ metaPhoneNumberId: displayPhoneNumber }] : [])
              ]
            }
          });

          if (channel && !channel.active) {
            return {
              success: true,
              ignored: true,
              reason: 'channel_inactive',
            };
          }

          if (!channel) {
            throw new Error(
              `Canal Meta não configurado para o Phone Number ID ${phoneNumberId}.`
            );
          }
        } catch (dbErr) {
          throw dbErr;
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

        // 2. Buscar ou criar Contato com resiliência
        let contact: any = null;
        try {
          contact = await prisma.contact.findFirst({
            where: { workspaceId: channel.workspaceId, phone: phone }
          });

          if (!contact) {
            contact = await prisma.contact.create({
              data: { name: pushName, phone: phone, workspaceId: channel.workspaceId }
            });
          }
        } catch (dbErr) {
          throw dbErr;
        }

        // 3. Buscar ou criar Conversa (Obrigatório cair na fila RECEPTION se não houver atendente atribuído)
        let isNewConversation = false;
        let conversation: any = null;
        try {
          conversation = await prisma.conversation.findFirst({
            where: {
              workspaceId: channel.workspaceId,
              channelId: channel.id,
              contactId: contact.id
            }
          });

          if (!conversation) {
            isNewConversation = true;
            conversation = await prisma.conversation.create({
              data: {
                idNumber: `#${Date.now().toString().slice(-8)}`,
                queue: 'RECEPTION',
                status: 'UNATTENDED',
                unreadCount: 1,
                workspaceId: channel.workspaceId,
                channelId: channel.id,
                contactId: contact.id,
                agentId: null,
                departmentId: null,
                lastCustomerMessageAt: new Date()
              }
            });

            await prisma.activityLog.create({
              data: {
                conversationId: conversation.id,
                userName: 'Sistema',
                action: `📥 Nova mensagem recebida via WhatsApp Meta (${channel.name}) - Entrada na Recepção`
              }
            }).catch(() => {});
          } else {
            const wasClosed = conversation.queue === 'CLOSED' || conversation.status === 'CLOSED';
            conversation = await prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                queue: wasClosed ? 'RECEPTION' : conversation.queue,
                status: wasClosed ? 'UNATTENDED' : conversation.status,
                agentId: wasClosed ? null : conversation.agentId,
                departmentId: wasClosed ? null : conversation.departmentId,
                lastCustomerMessageAt: new Date(),
                unreadCount: { increment: 1 },
                updatedAt: new Date()
              }
            });
          }
        } catch (dbErr) {
          throw dbErr;
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
          queue: conversation.queue,
          can_reply: conversation.queue === 'CONVERSATION' && Boolean(conversation.agentId),
          account_id: 1,
          uuid: conversation.id,
          additional_attributes: {},
          agent_last_seen_at: 0,
          assignee_last_seen_at: 0,
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
          last_customer_message_at: conversation.lastCustomerMessageAt || nowSec,
          meta: {
            sender: {
              id: contact?.id || 1,
              name: contact?.name || 'Cliente WhatsApp',
              avatar_url: '',
              type: 'contact',
              phone_number: contact?.phone || ''
            },
            assignee: conversation.agentId ? { id: conversation.agentId } : null,
            team: conversation.departmentId ? { id: conversation.departmentId } : null,
            hmac_verified: false
          },
          messages: [formattedMsg]
        };

        if (isNewConversation) {
          emitToWorkspace(channel.workspaceId, 'conversation.created', formattedConv);
        } else {
          emitToWorkspace(channel.workspaceId, 'conversation.updated', formattedConv);
        }

        emitToWorkspace(channel.workspaceId, 'message.created', formattedMsg);

        // Eventos legados
        emitToWorkspace(channel.workspaceId, 'message:new', {
          message: newMessage,
          conversationId: conversation.id
        });

        emitToWorkspace(channel.workspaceId, 'conversation:updated', {
          conversationId: conversation.id,
          conversation: conversation
        });

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
