export type ViewKey = 
  | 'conversas'
  | 'kanban'
  | 'contatos'
  | 'relatorios'
  | 'ajuda'
  | 'simulador'
  | 'configuracoes'

export interface SubNavigationItem {
  key: string
  label: string
  icon?: string
}

export interface NavigationItem {
  key: ViewKey
  label: string
  icon: string
  badge?: number | string
  superAdminOnly?: boolean
  group?: 'operacional' | 'gestao' | 'sistema'
  children?: SubNavigationItem[]
}
