import axios from 'axios';
import { prisma } from '../lib/prisma';
import { EvolutionService } from './evolution.service';
import { MetaService } from './meta.service';
import { emitToWorkspace } from '../socket/socket';

export class AiService {
  /**
   * Gerar resumo de atendimento para uma conversa específica
   */
  static async summarizeConversation(conversationId: string): Promise<string> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          contact: true,
          agent: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation) {
        throw new Error('Conversa não encontrada');
      }

      if (conversation.messages.length === 0) {
        return 'Conversa sem histórico de mensagens para resumir.';
      }

      const formattedMessages = conversation.messages
        .map(m => `${m.senderName}: ${m.content}`)
        .join('\n');

      const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      let summaryText = '';

      if (apiKey) {
        try {
          const isOpenAi = apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-');
          const endpoint = isOpenAi 
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://openrouter.ai/api/v1/chat/completions';
          
          const model = isOpenAi ? 'gpt-4o-mini' : 'meta-llama/llama-3-8b-instruct:free';

          const response = await axios.post(
            endpoint,
            {
              model: model,
              messages: [
                {
                  role: 'system',
                  content: 'Você é um assistente de inteligência artificial de suporte ao cliente. Resuma a conversa a seguir em tópicos claros em português: 1. Motivo do Contato, 2. Principais Dúvidas/Solicitações, 3. Resolução/Status Final.'
                },
                {
                  role: 'user',
                  content: `Cliente: ${conversation.contact.name}\nAtendente: ${conversation.agent?.name || 'Sistema'}\n\nMensagens:\n${formattedMessages}`
                }
              ],
              temperature: 0.5,
              max_tokens: 350
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 12000
            }
          );

          summaryText = response.data?.choices?.[0]?.message?.content || '';
        } catch (apiError: any) {
          console.warn('⚠️ [AiService] Erro ao chamar API de IA, gerando resumo estruturado local:', apiError.message);
        }
      }

      if (!summaryText) {
        const lastMsg = conversation.messages[conversation.messages.length - 1];
        summaryText = `📌 Resumo do Atendimento:\n• Cliente: ${conversation.contact.name}\n• Total de Mensagens: ${conversation.messages.length}\n• Último Tópico: "${lastMsg.content.slice(0, 100)}..."\n• Status Atual: ${conversation.status === 'CLOSED' ? 'Encerrado' : 'Em Atendimento'}`;
      }

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { aiSummary: summaryText }
      });

      console.log(`🤖 [AiService] Resumo de IA gerado com sucesso para a conversa ID ${conversationId}`);
      return summaryText;
    } catch (error: any) {
      console.error('❌ [AiService] Erro ao resumir conversa:', error);
      throw error;
    }
  }

  /**
   * Processar e responder mensagem automaticamente na fila RECEPTION
   */
  static async handleAiAutoResponse(conversationId: string, customerMessageText: string): Promise<boolean> {
    try {
      // 1. Reconsultar a conversa no banco antes de gerar a resposta
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { contact: true, channel: true }
      });

      if (!conversation) return false;

      // GUARDRAIL DE SEGURANÇA DA IA:
      // Responder APENAS se estiver na Recepção (RECEPTION), sem atendente humano (agentId == null) e não encerrada.
      if (conversation.queue !== 'RECEPTION' || conversation.agentId !== null || conversation.status === 'CLOSED') {
        console.log(`🤖 [AiService] Resposta automática de IA cancelada/ignorada (Fila: ${conversation.queue}, Atendente: ${conversation.agentId})`);
        return false;
      }

      const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      let aiResponseText = '';

      if (apiKey) {
        try {
          const isOpenAi = apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-');
          const endpoint = isOpenAi 
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://openrouter.ai/api/v1/chat/completions';
          
          const model = isOpenAi ? 'gpt-4o-mini' : 'meta-llama/llama-3-8b-instruct:free';

          const response = await axios.post(
            endpoint,
            {
              model: model,
              messages: [
                {
                  role: 'system',
                  content: 'Você é a Inteligência Artificial de atendimento inicial da plataforma Abravely Chat. Responda o cliente de forma extremamente cortês, objetiva e em português. Informe que a solicitação dele foi recebida na Recepção e será direcionada à equipe em breve.'
                },
                {
                  role: 'user',
                  content: customerMessageText
                }
              ],
              temperature: 0.7,
              max_tokens: 250
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );

          aiResponseText = response.data?.choices?.[0]?.message?.content || '';
        } catch (apiError: any) {
          console.warn('⚠️ [AiService] Falha ao chamar API de IA para auto-resposta, usando resposta padrão:', apiError.message);
        }
      }

      if (!aiResponseText) {
        aiResponseText = `Olá! Sou a Inteligência Artificial de atendimento do Abravely Chat 🤖. Recebi sua mensagem: "${customerMessageText.slice(0, 60)}...". Sua solicitação está na Recepção e será direcionada a um atendente em instantes!`;
      }

      // 2. Reconsultar a conversa NOVAMENTE antes de salvar/disparar para garantir que nenhum atendente assumiu a conversa durante a geração
      const recheckedConv = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!recheckedConv || recheckedConv.queue !== 'RECEPTION' || recheckedConv.agentId !== null || recheckedConv.status === 'CLOSED') {
        console.log(`🤖 [AiService] Resposta da IA descartada no último segundo: a conversa foi assumida/transferida/encerrada durante o processamento.`);
        return false;
      }

      // 3. Salvar a mensagem da IA no banco de dados com tratamento para concorrência/exclusão
      let aiMessage: any;
      try {
        aiMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: aiResponseText,
            contentType: 'TEXT',
            senderType: 'AGENT',
            senderName: 'IA',
            avatarPill: 'IA',
            isPrivate: false
          }
        });
      } catch (dbError: any) {
        console.log(`🤖 [AiService] Resposta da IA cancelada: conversa ${conversation.id} não existe mais no banco.`);
        return false;
      }

      // 4. Disparar via WhatsApp no canal correto (Evolution ou Meta)
      const channel = conversation.channel;
      if (conversation.contact.phone) {
        try {
          if (channel.type === 'EVOLUTION' && channel.evolutionInstanceName) {
            await EvolutionService.sendTextMessage(
              channel.evolutionInstanceName,
              conversation.contact.phone,
              aiResponseText
            );
          } else if (channel.type === 'META_CLOUD' && channel.metaPhoneNumberId && channel.metaToken) {
            await MetaService.sendTextMessage(
              channel.metaPhoneNumberId,
              channel.metaToken,
              conversation.contact.phone,
              aiResponseText
            );
          }
        } catch (dispatchError: any) {
          console.warn(`⚠️ [AiService] Mensagem da IA salva mas falhou disparo no canal WhatsApp: ${dispatchError.message}`);
        }
      }

      // 5. Criar log de auditoria
      const log = await prisma.activityLog.create({
        data: {
          conversationId: conversation.id,
          userName: 'IA',
          action: '🤖 Resposta automática gerada e enviada pela IA na Recepção'
        }
      });

      // 6. Atualizar data da conversa e emitir eventos de WebSocket padronizados
      const updatedConv = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
        include: { contact: true, channel: true, department: true, agent: true }
      });

      emitToWorkspace(conversation.workspaceId, 'message:new', {
        message: aiMessage,
        conversationId: conversation.id
      });

      emitToWorkspace(conversation.workspaceId, 'conversation:updated', {
        conversationId: conversation.id,
        conversation: updatedConv,
        log
      });

      console.log(`🤖 [AiService] Resposta automática da IA enviada com sucesso na Recepção (Conversa ID ${conversation.idNumber})`);
      return true;
    } catch (error: any) {
      console.error('❌ [AiService] Erro no fluxo completo de resposta da IA:', error);
      return false;
    }
  }
}
