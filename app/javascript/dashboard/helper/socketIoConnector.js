import { io } from 'socket.io-client';
import { emitter } from 'shared/helpers/mitt';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import { toUIConversation, toUIMessage } from 'dashboard/store/modules/conversations/abravelyAdapter';

const DEDUPLICATION_LIMIT = 200;

/**
 * Conector Socket.io Real do Abravely Chat
 * Conecta via socket.io-client e gerencia eventos em tempo real com deduplicacao.
 */
class SocketIoConnector {
  constructor(app, options = {}) {
    this.app = app;
    this.options = options;
    this.socket = null;
    this.isConnected = false;

    this.processedMessageIds = new Set();
    this.processedConversationEvents = new Map();

    this.domainEvents = [
      'conversation.created',
      'conversation.updated',
      'message.created',
      'conversation.assigned',
      'conversation.status_updated',
    ];
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return;
    }

    const { websocketURL = '' } = window.chatwootConfig || {};
    const targetUrl = websocketURL || (typeof window !== 'undefined' ? window.location.origin : '');

    const accountId = this.app?.$store?.getters?.getCurrentAccountId;
    const userId = this.app?.$store?.getters?.getCurrentUserID;

    this.socket = io(targetUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      query: {
        account_id: accountId,
        user_id: userId,
      },
      ...this.options,
    });

    this.bindEvents();
  }

  bindEvents() {
    if (!this.socket) return;

    // Eventos de ciclo de vida da conexao
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.app?.$store?.dispatch('conversations/setError', null);
      emitter.emit(BUS_EVENTS.WEBSOCKET_RECONNECT);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      emitter.emit(BUS_EVENTS.WEBSOCKET_DISCONNECT);
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      const errorMsg = error?.message || 'Falha de conexão com o servidor de tempo real (Socket.io)';
      if (this.app?.$store) {
        this.app.$store.commit('SET_CONVERSATIONS_ERROR', errorMsg);
      }
    });

    this.socket.on('reconnect', (attempt) => {
      this.isConnected = true;
      if (this.app?.$store) {
        this.app.$store.commit('SET_CONVERSATIONS_ERROR', null);
      }
      emitter.emit(BUS_EVENTS.WEBSOCKET_RECONNECT);
    });

    this.socket.on('reconnect_failed', () => {
      this.isConnected = false;
      if (this.app?.$store) {
        this.app.$store.commit(
          'SET_CONVERSATIONS_ERROR',
          'Não foi possível restabelecer a conexão de tempo real. Clique em tentar novamente.'
        );
      }
    });

    // Eventos de dominio
    this.socket.on('conversation.created', (payload) => this.onConversationCreated(payload));
    this.socket.on('conversation.updated', (payload) => this.onConversationUpdated(payload));
    this.socket.on('message.created', (payload) => this.onMessageCreated(payload));
    this.socket.on('conversation.assigned', (payload) => this.onConversationAssigned(payload));
    this.socket.on('conversation.status_updated', (payload) => this.onConversationStatusUpdated(payload));
  }

  disconnect() {
    if (!this.socket) return;

    // Remover todos os listeners de dominio e conexao
    this.domainEvents.forEach((evt) => this.socket.off(evt));
    this.socket.off('connect');
    this.socket.off('disconnect');
    this.socket.off('connect_error');
    this.socket.off('reconnect');
    this.socket.off('reconnect_failed');

    this.socket.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  isDuplicateMessage(messageId) {
    if (!messageId) return false;
    if (this.processedMessageIds.has(messageId)) {
      return true;
    }
    this.processedMessageIds.add(messageId);
    if (this.processedMessageIds.size > DEDUPLICATION_LIMIT) {
      const firstItem = this.processedMessageIds.values().next().value;
      this.processedMessageIds.delete(firstItem);
    }
    return false;
  }

  isDuplicateConversationEvent(conversationId, eventType) {
    if (!conversationId) return false;
    const key = `${conversationId}:${eventType}`;
    const now = Date.now();
    const lastTime = this.processedConversationEvents.get(key);
    if (lastTime && now - lastTime < 300) {
      return true;
    }
    this.processedConversationEvents.set(key, now);
    if (this.processedConversationEvents.size > DEDUPLICATION_LIMIT) {
      const firstKey = this.processedConversationEvents.keys().next().value;
      this.processedConversationEvents.delete(firstKey);
    }
    return false;
  }

  onConversationCreated(payload) {
    if (this.isDuplicateConversationEvent(payload?.id, 'created')) return;
    const uiConversation = toUIConversation(payload);
    this.app?.$store?.dispatch('addConversation', uiConversation);
  }

  onConversationUpdated(payload) {
    if (this.isDuplicateConversationEvent(payload?.id, 'updated')) return;
    const uiConversation = toUIConversation(payload);
    this.app?.$store?.dispatch('updateConversation', uiConversation);
  }

  onMessageCreated(payload) {
    if (this.isDuplicateMessage(payload?.id)) return;
    const uiMessage = toUIMessage(payload);
    const conversationId = uiMessage.conversation_id;
    const lastActivityAt = uiMessage.created_at;

    this.app?.$store?.dispatch('addMessage', uiMessage);
    if (conversationId && lastActivityAt) {
      this.app?.$store?.dispatch('updateConversationLastActivity', {
        conversationId,
        lastActivityAt,
      });
    }
  }

  onConversationAssigned(payload) {
    if (this.isDuplicateConversationEvent(payload?.id, 'assigned')) return;
    const uiConversation = toUIConversation(payload);
    this.app?.$store?.dispatch('updateConversation', uiConversation);
  }

  onConversationStatusUpdated(payload) {
    if (this.isDuplicateConversationEvent(payload?.id, 'status_updated')) return;
    const uiConversation = toUIConversation(payload);
    this.app?.$store?.dispatch('updateConversation', uiConversation);
  }
}

export default SocketIoConnector;
