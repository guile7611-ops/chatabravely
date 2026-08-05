const toTimestamp = value => {
  if (!value) return value;
  if (typeof value === 'number') return value > 1e12 ? Math.floor(value / 1000) : value;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? value : Math.floor(parsed / 1000);
};

export const normalizeRealtimeMessage = payload => {
  const message = payload?.message || payload || {};
  const conversationId =
    message.conversationId || message.conversation_id || payload?.conversationId;

  return {
    ...message,
    conversationId,
    conversation_id: conversationId,
    created_at: toTimestamp(message.created_at || message.createdAt),
    createdAt: message.createdAt || message.created_at,
  };
};

export const normalizeRealtimeConversation = payload => {
  const conversation = payload?.conversation || payload || {};
  const messages = Array.isArray(conversation.messages)
    ? conversation.messages.map(normalizeRealtimeMessage)
    : [];
  const contact = conversation.contact || conversation.meta?.sender;
  const channel = conversation.channel || conversation.meta?.channel;

  return {
    ...conversation,
    contact,
    channel,
    messages,
    created_at: toTimestamp(conversation.created_at || conversation.createdAt),
    updated_at: toTimestamp(
      conversation.updated_at || conversation.updatedAt || conversation.last_activity_at
    ),
    last_activity_at: toTimestamp(
      conversation.last_activity_at || conversation.updatedAt || conversation.updated_at
    ),
  };
};
