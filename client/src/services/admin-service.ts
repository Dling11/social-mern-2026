import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { AdminPostRow, AdminStats, AdminUserRow, ResetAdminUserPasswordPayload } from '@/types/admin'
import type { ApiErrorResponse } from '@/types/http'

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await apiClient.get<{ stats: AdminStats }>('/admin/stats')
    return data.stats
  },
  async getUsers(): Promise<AdminUserRow[]> {
    const { data } = await apiClient.get<{ users: AdminUserRow[] }>('/admin/users')
    return data.users
  },
  async getPosts(): Promise<AdminPostRow[]> {
    const { data } = await apiClient.get<{ posts: AdminPostRow[] }>('/admin/posts')
    return data.posts
  },
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<AdminUserRow> {
    const { data } = await apiClient.patch<{ user: AdminUserRow }>(`/admin/users/${userId}/role`, { role })
    return data.user
  },
  async resetUserPassword({ userId, password }: ResetAdminUserPasswordPayload) {
    await apiClient.patch(`/admin/users/${userId}/password`, { password })
  },
  async deleteUser(userId: string) {
    await apiClient.delete(`/admin/users/${userId}`)
  },
  async deletePost(postId: string) {
    await apiClient.delete(`/admin/posts/${postId}`)
  },
  getErrorMessage(error: unknown) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
