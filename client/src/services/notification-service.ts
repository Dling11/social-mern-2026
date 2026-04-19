import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { ApiErrorResponse } from '@/types/http'
import type { AppNotification } from '@/types/notification'

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<{ notifications: AppNotification[] }>('/notifications')
    return data.notifications
  },
  async markRead(notificationId: string) {
    await apiClient.post(`/notifications/${notificationId}/read`)
  },
  async markAllRead() {
    await apiClient.post('/notifications/read-all')
  },
  getErrorMessage(error: unknown) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
