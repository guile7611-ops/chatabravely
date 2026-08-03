export interface ChannelFixture {
  id: string
  name: string
  type: 'EVOLUTION' | 'META_CLOUD'
  status: 'CONNECTED' | 'DISCONNECTED'
  updatedAt: string
}

export const MOCK_CHANNELS: ChannelFixture[] = [
  {
    id: 'chan-1',
    name: 'WhatsApp Comercial Evolution',
    type: 'EVOLUTION',
    status: 'CONNECTED',
    updatedAt: 'Há 5 minutos'
  },
  {
    id: 'chan-2',
    name: 'WhatsApp Oficial Meta Cloud',
    type: 'META_CLOUD',
    status: 'CONNECTED',
    updatedAt: 'Ativo'
  }
]
