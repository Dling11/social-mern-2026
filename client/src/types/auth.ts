export interface AuthUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  middleName?: string | null
  username?: string | null
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
  coverUrl?: string | null
}

export interface AuthResponse {
  user: AuthUser
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  middleName?: string
  username: string
  email: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
