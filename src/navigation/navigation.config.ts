import type { NavigationItem } from './types'

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    key: 'conversas',
    label: 'Conversas',
    icon: 'lucide:message-circle',
    group: 'operacional',
    children: [
      { key: 'conversas', label: 'Todas as conversas', icon: 'lucide:inbox' }
    ]
  },
  {
    key: 'kanban',
    label: 'Kanban',
    icon: 'lucide:columns-3',
    group: 'operacional'
  },
  {
    key: 'contatos',
    label: 'Contatos',
    icon: 'lucide:contact-2',
    group: 'operacional'
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    icon: 'lucide:trending-up',
    group: 'gestao',
    children: [
      { key: 'relatorios', label: 'Visão geral' }
    ]
  },
  {
    key: 'ajuda',
    label: 'Central de Ajuda',
    icon: 'lucide:library',
    group: 'gestao'
  },
  {
    key: 'simulador',
    label: 'Simulador WhatsApp',
    icon: 'lucide:smartphone',
    superAdminOnly: true,
    group: 'sistema'
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    icon: 'lucide:settings',
    group: 'sistema'
  }
]
