export interface UserEntity {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'AGENT'
  avatarUrl?: string | null
  isOnline: boolean
}
