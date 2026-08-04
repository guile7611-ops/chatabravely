/**
 * Adaptador de Dados Abravely Chat -> UI do Frontend
 * Converte respostas e eventos do contrato Abravely para a estrutura consumida pelos componentes legados.
 */

export const DIRECTION_MAP = {
  inbound: 0,
  incoming: 0,
  outbound: 1,
  outgoing: 1,
  activity: 2,
  template: 3,
};

export function toUIMessage(data = {}) {
  if (!data) return {};

  // Se ja estiver no formato legado (message_type presente), mantem a estrutura
  if (data.message_type !== undefined) {
    return data;
  }

  const directionStr = String(data.direction || 'inbound').toLowerCase();
  const messageType = DIRECTION_MAP[directionStr] !== undefined ? DIRECTION_MAP[directionStr] : 0;
  const rawCreatedAt = data.createdAt || data.created_at;
  const createdAt =
    typeof rawCreatedAt === 'number'
      ? (rawCreatedAt > 1e12 ? rawCreatedAt / 1000 : rawCreatedAt)
      : rawCreatedAt
        ? new Date(rawCreatedAt).getTime() / 1000
        : Math.floor(Date.now() / 1000);

  return {
    id: data.id,
    conversation_id: data.conversationId || data.conversation_id,
    content: data.content || '',
    message_type: messageType,
    created_at: createdAt,
    content_type: data.contentType || data.content_type || 'text',
    sender: data.sender || null,
    private: Boolean(data.private),
    status: data.status || 'sent',
    attachments: data.attachments || [],
  };
}

export function toUIConversation(data = {}) {
  if (!data) return {};

  // Preserva se ja possui estrutura de meta completa
  const meta = data.meta || {};
  const contact = data.contact || meta.sender || {};
  const assignee = data.assignee || meta.assignee || null;
  const team = data.team || meta.team || null;

  const assignedAgentId = data.assignedAgentId !== undefined ? data.assignedAgentId : (data.assignee_id || (assignee ? assignee.id : null));

  return {
    id: data.id,
    account_id: data.accountId || data.account_id || 1,
    inbox_id: data.inboxId || data.inbox_id || null,
    status: data.status || 'open',
    assignee_id: assignedAgentId,
    team_id: data.departmentId || data.team_id || (team ? team.id : null),
    unread_count: data.unreadCount !== undefined ? data.unreadCount : (data.unread_count || 0),
    last_activity_at: data.lastMessageAt ? new Date(data.lastMessageAt).getTime() / 1000 : (data.last_activity_at || Math.floor(Date.now() / 1000)),
    meta: {
      sender: contact,
      assignee: assignee || (assignedAgentId ? { id: assignedAgentId } : null),
      team: team || (data.departmentId ? { id: data.departmentId } : null),
      channel: data.channel || meta.channel || 'Channel::Whatsapp',
    },
    messages: Array.isArray(data.messages) ? data.messages.map(toUIMessage) : [],
    allMessagesLoaded: Boolean(data.allMessagesLoaded),
    dataFetched: Boolean(data.dataFetched),
  };
}
