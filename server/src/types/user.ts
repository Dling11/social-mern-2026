export interface AuthenticatedUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  middleName?: string | null
  username?: string | null
  bio?: string | null
  avatarCaption?: string | null
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
  coverUrl?: string | null
}
