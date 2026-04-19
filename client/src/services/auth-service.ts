import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'
import type { ApiErrorResponse } from '@/types/http'

const AUTH_BASE = '/auth'

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>(`${AUTH_BASE}/register`, payload)
    return data.user
  },
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>(`${AUTH_BASE}/login`, payload)
    return data.user
  },
  async logout(): Promise<void> {
    await apiClient.post(`${AUTH_BASE}/logout`)
  },
  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthResponse>(`${AUTH_BASE}/me`)
    return data.user
  },
  getErrorMessage(error: unknown): string {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
