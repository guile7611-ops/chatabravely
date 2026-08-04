import { emitter } from 'shared/helpers/mitt';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import { toUIConversation, toUIMessage } from 'dashboard/store/modules/conversations/abravelyAdapter';

/**
 * Conector Socket.io do Abravely Chat
 * Gerencia o ciclo de vida dos eventos de conversas e mensagens em tempo real.
 */
class SocketIoConnector {
  constructor(app, options = {}) {
    this.app = app;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.options = options;
    this.handlers = {
      'conversation.created': this.onConversationCreated.bind(this),
      'conversation.updated': this.onConversationUpdated.bind(this),
      'message.created': this.onMessageCreated.bind(this),
      'conversation.assigned': this.onConversationAssigned.bind(this),
      'conversation.status_updated': this.onConversationStatusUpdated.bind(this),
    };
  }

  connect() {
    this.isConnected = true;
    emitter.emit(BUS_EVENTS.WEBSOCKET_RECONNECT);
  }

  disconnect() {
    this.isConnected = false;
    emitter.emit(BUS_EVENTS.WEBSOCKET_DISCONNECT);
  }

  handleEvent(eventName, payload) {
    if (this.handlers[eventName]) {
      this.handlers[eventName](payload);
    }
  }

  onConversationCreated(payload) {
    const uiConversation = toUIConversation(payload);
    this.app.$store.dispatch('addConversation', uiConversation);
  }

  onConversationUpdated(payload) {
    const uiConversation = toUIConversation(payload);
    this.app.$store.dispatch('updateConversation', uiConversation);
  }

  onMessageCreated(payload) {
    const uiMessage = toUIMessage(payload);
    const conversationId = uiMessage.conversation_id;
    const lastActivityAt = uiMessage.created_at;

    this.app.$store.dispatch('addMessage', uiMessage);
    if (conversationId && lastActivityAt) {
      this.app.$store.dispatch('updateConversationLastActivity', {
        conversationId,
        lastActivityAt,
      });
    }
  }

  onConversationAssigned(payload) {
    const uiConversation = toUIConversation(payload);
    this.app.$store.dispatch('updateConversation', uiConversation);
  }

  onConversationStatusUpdated(payload) {
    const uiConversation = toUIConversation(payload);
    this.app.$store.dispatch('updateConversation', uiConversation);
  }
}

export default SocketIoConnector;
