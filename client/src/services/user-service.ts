import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { AuthUser } from '@/types/auth'
import type { ApiErrorResponse } from '@/types/http'

export const userService = {
  async searchUsers(query: string): Promise<AuthUser[]> {
    const { data } = await apiClient.get<{ users: AuthUser[] }>('/users/search', {
      params: { q: query },
    })
    return data.users
  },
  getErrorMessage(error: unknown) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
