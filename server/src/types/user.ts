export interface AuthenticatedUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  middleName?: string | null
  username?: string | null
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
}
