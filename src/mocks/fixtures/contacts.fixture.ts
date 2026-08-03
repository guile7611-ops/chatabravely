import type { ContactEntity } from '../../entities/contact/model'

export const MOCK_CONTACTS: ContactEntity[] = [
  {
    id: 'cnt-1',
    name: 'Carlos Eduardo',
    phone: '+55 11 98877-6655',
    email: 'carlos@bellanapoli.com',
    company: 'Pizzaria Bella Napoli',
    avatarUrl: null,
    createdAt: '2026-07-29'
  },
  {
    id: 'cnt-2',
    name: 'Mariana Souza',
    phone: '+55 11 97766-5544',
    email: 'mariana.souza@email.com',
    company: 'Tech Solutions',
    avatarUrl: null,
    createdAt: '2026-07-30'
  },
  {
    id: 'cnt-3',
    name: 'Roberto Alves',
    phone: '+55 21 99988-1122',
    email: 'roberto@alvesadvocacia.com.br',
    company: 'Alves Advocacia',
    avatarUrl: null,
    createdAt: '2026-07-31'
  }
]
