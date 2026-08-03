export type UserRole = 'ADMIN' | 'AGENT';

export type ConversationStatus = 'UNATTENDED' | 'OPEN' | 'CLOSED';
export type ConversationQueue = 'RECEPTION' | 'DEPARTMENT' | 'CONVERSATION' | 'CLOSED';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleCode?: UserRole;
  avatarUrl?: string;
  status?: string;
  online?: string;
}

export interface ChatContact {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  company?: string;
  biography?: string;
  location?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system' | 'note';
  name: string;
  avatarPill?: string;
  time: string;
  text: string;
  isPrivate?: boolean;
}

export interface ChatConversation {
  id: string;
  idNumber: string;
  customer: string;
  phone: string;
  avatar: string;
  avatarImg?: string;
  bio?: string;
  company?: string;
  email?: string;
  location?: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  assignedTo?: string;
  assignedTeam?: string;
  status?: ConversationStatus;
  queue?: ConversationQueue;
  priority?: string;
  slaTimer?: string;
  channelType?: 'evolution' | 'meta';
  channelId?: string;
  contactId?: string;
  messages: ChatMessage[];
  contact?: ChatContact;
  aiSummary?: string;
  duration?: string;
  date?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: string;
  connectionStatus: string;
  evolutionInstanceName?: string;
  qrCodeBase64?: string;
}
