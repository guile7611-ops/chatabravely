export interface MessageEntity {
  id: string
  conversationId: string
  content: string
  senderType: 'USER' | 'AGENT' | 'SYSTEM' | 'AI' | 'NOTE'
  senderName: string
  createdAt: string
  mediaUrl?: string | null
  mediaType?: string | null
}

export interface ConversationEntity {
  id: string
  contactName: string
  contactPhone?: string
  contactAvatar?: string | null
  channelName: string
  status: 'ABERTA' | 'PENDENTE' | 'RESOLVIDA' | 'UNATTENDED' | 'OPEN' | 'CLOSED'
  lastMessage: string
  unreadCount: number
  updatedAt: string
  assignedAgent?: string
  department?: string
  closureReason?: string | null
  aiSummary?: string | null
}
