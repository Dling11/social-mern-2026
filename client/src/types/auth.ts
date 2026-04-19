export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  coverUrl?: string | null
}

export interface AuthResponse {
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}
