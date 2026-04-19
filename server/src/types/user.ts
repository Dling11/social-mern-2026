export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
}
