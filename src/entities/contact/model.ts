export interface ContactEntity {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  company?: string | null
  avatarUrl?: string | null
  createdAt: string
}
