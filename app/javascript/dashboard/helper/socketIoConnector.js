import { io } from 'socket.io-client';
import { getAbravelyJwtToken } from './abravelyToken';
import { emitter } from 'shared/helpers/mitt';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import { toUIConversation, toUIMessage } from 'dashboard/store/modules/conversations/abravelyAdapter';

const DEDUPLICATION_LIMIT = 200;

export const getSocketUrl = (location = window.location) => {
  const { websocketURL = '' } = window.chatwootConfig || {};
  if (websocketURL) return websocketURL;
  if (typeof window !== 'undefined' && location) {
    // During local development, connect straight to Express. This avoids a
    // second WebSocket hop through Vite, which can otherwise surface as a
    // delayed Socket.IO "timeout" despite the backend being available.
    if (location.port === '5173') {
      return 'http://localhost:3000';
    }
    return location.origin;
  }
  return '';
};

/**
 * Conector Socket.io Autenticado do Abravely Chat
 * Validação Estrita de JWT do Express
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
      'conversation:created',
      'conversation.updated',
      'conversation:updated',
      'message.created',
      'message:created',
      'message:new',
      'conversation.assigned',
      'conversation:assigned',
      'conversation.status_updated',
      'conversation:status_updated',
    ];
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return;
    }

    const token = getAbravelyJwtToken();

    // Se não houver JWT Abravely válido, recusa a conexão e registra erro explícito na store
    if (!token) {
      this.isConnected = false;
      if (this.app?.$store) {
        this.app.$store.commit(
          'SET_CONVERSATIONS_ERROR',
          'Autenticação WebSocket falhou: JWT Abravely não localizado. Faça login novamente.'
        );
      }
      return;
    }

    const targetUrl = getSocketUrl();

    this.socket = io(targetUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: {
        token: token,
      },
      ...this.options,
    });

    this.bindEvents();
  }

  bindEvents() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      if (this.app?.$store) {
        this.app.$store.commit('SET_CONVERSATIONS_ERROR', null);
      }
      emitter.emit(BUS_EVENTS.WEBSOCKET_RECONNECT);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      emitter.emit(BUS_EVENTS.WEBSOCKET_DISCONNECT);
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      const errorMsg = error?.message || 'Autenticação WebSocket falhou: Token JWT inválido ou expirado.';
      if (this.app?.$store) {
        this.app.$store.commit('SET_CONVERSATIONS_ERROR', errorMsg);
      }
    });

    this.socket.on('reconnect', () => {
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

    // Mapeamento de eventos canônicos e aliases
    const handleConversationCreated = (payload) => this.onConversationCreated(payload);
    const handleConversationUpdated = (payload) => this.onConversationUpdated(payload);
    const handleMessageCreated = (payload) => this.onMessageCreated(payload);
    const handleConversationAssigned = (payload) => this.onConversationAssigned(payload);
    const handleConversationStatusUpdated = (payload) => this.onConversationStatusUpdated(payload);

    this.socket.on('conversation.created', handleConversationCreated);
    this.socket.on('conversation:created', handleConversationCreated);

    this.socket.on('conversation.updated', handleConversationUpdated);
    this.socket.on('conversation:updated', handleConversationUpdated);

    this.socket.on('message.created', handleMessageCreated);
    this.socket.on('message:created', handleMessageCreated);
    this.socket.on('message:new', handleMessageCreated);

    this.socket.on('conversation.assigned', handleConversationAssigned);
    this.socket.on('conversation:assigned', handleConversationAssigned);

    this.socket.on('conversation.status_updated', handleConversationStatusUpdated);
    this.socket.on('conversation:status_updated', handleConversationStatusUpdated);
  }

  disconnect() {
    if (!this.socket) return;

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
    const strId = String(messageId);
    if (this.processedMessageIds.has(strId)) {
      return true;
    }
    this.processedMessageIds.add(strId);
    if (this.processedMessageIds.size > DEDUPLICATION_LIMIT) {
      const firstItem = this.processedMessageIds.values().next().value;
      this.processedMessageIds.delete(firstItem);
    }
    return false;
  }

  isDuplicateConversationEvent(conversationId, eventType) {
    if (!conversationId) return false;
    const key = `${String(conversationId)}:${eventType}`;
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

export const disconnectSocketIo = () => {
  if (typeof window !== 'undefined' && window.__abravelySocketConnector) {
    window.__abravelySocketConnector.disconnect();
    window.__abravelySocketConnector = null;
  }
};

export default SocketIoConnector;
