import type { ConversationEntity, MessageEntity } from '../../entities/conversation/model'

export const MOCK_CONVERSATIONS: ConversationEntity[] = [
  {
    id: 'conv-101',
    contactName: 'Carlos Eduardo (Bella Napoli)',
    contactPhone: '+55 11 98877-6655',
    contactAvatar: null,
    channelName: 'WhatsApp Comercial',
    status: 'ABERTA',
    lastMessage: 'Gostaria de confirmar o pedido de 10 pizzas para a reunião.',
    unreadCount: 2,
    updatedAt: '14:32',
    assignedAgent: 'Guilherme',
    department: 'Recepção'
  },
  {
    id: 'conv-102',
    contactName: 'Mariana Souza',
    contactPhone: '+55 11 97766-5544',
    contactAvatar: null,
    channelName: 'Webchat Suporte',
    status: 'PENDENTE',
    lastMessage: 'Estou aguardando a segunda via da fatura.',
    unreadCount: 0,
    updatedAt: '13:15',
    assignedAgent: 'Ana Paula',
    department: 'Financeiro'
  },
  {
    id: 'conv-103',
    contactName: 'Roberto Alves',
    contactPhone: '+55 21 99988-1122',
    contactAvatar: null,
    channelName: 'WhatsApp Oficial Meta',
    status: 'ABERTA',
    lastMessage: 'Dúvida sobre cobrança encaminhada ao setor responsável.',
    unreadCount: 1,
    updatedAt: '11:40',
    assignedAgent: 'IA Sumarizadora',
    department: 'Suporte Técnico'
  },
  {
    id: 'conv-104',
    contactName: 'Fernando Silva',
    contactPhone: '+55 11 95544-3322',
    contactAvatar: null,
    channelName: 'WhatsApp Comercial',
    status: 'ABERTA',
    lastMessage: 'Olá, gostaria de saber os horários de atendimento da recepção.',
    unreadCount: 0,
    updatedAt: '09:10',
    assignedAgent: undefined,
    department: 'Recepção'
  }
]

export const MOCK_MESSAGES: Record<string, MessageEntity[]> = {
  'conv-101': [
    {
      id: 'msg-1',
      conversationId: 'conv-101',
      content: 'Olá! Boa tarde. Vocês atendem pedidos corporativos em quantidade?',
      senderType: 'USER',
      senderName: 'Carlos Eduardo',
      createdAt: '14:28'
    },
    {
      id: 'msg-2',
      conversationId: 'conv-101',
      content: 'Olá Carlos! Sim, atendemos sim. Temos pacotes corporativos com desconto.',
      senderType: 'AGENT',
      senderName: 'Guilherme',
      createdAt: '14:30'
    },
    {
      id: 'msg-3',
      conversationId: 'conv-101',
      content: 'Cliente solicitou proposta para 10 pizzas tamanho grande para sexta-feira.',
      senderType: 'NOTE',
      senderName: 'Guilherme',
      createdAt: '14:31'
    },
    {
      id: 'msg-4',
      conversationId: 'conv-101',
      content: 'Gostaria de confirmar o pedido de 10 pizzas para a reunião.',
      senderType: 'USER',
      senderName: 'Carlos Eduardo',
      createdAt: '14:32'
    }
  ]
}
