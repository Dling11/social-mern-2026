import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { FriendListResponse } from '@/types/friend'
import type { ApiErrorResponse } from '@/types/http'

const FRIEND_BASE = '/friends'

export const friendService = {
  async getLists(): Promise<FriendListResponse> {
    const { data } = await apiClient.get<FriendListResponse>(FRIEND_BASE)
    return data
  },
  async sendRequest(userId: string): Promise<FriendListResponse> {
    const { data } = await apiClient.post<FriendListResponse>(`${FRIEND_BASE}/requests/${userId}`)
    return data
  },
  async acceptRequest(userId: string): Promise<FriendListResponse> {
    const { data } = await apiClient.post<FriendListResponse>(`${FRIEND_BASE}/requests/${userId}/accept`)
    return data
  },
  async declineRequest(userId: string): Promise<FriendListResponse> {
    const { data } = await apiClient.post<FriendListResponse>(`${FRIEND_BASE}/requests/${userId}/decline`)
    return data
  },
  async cancelRequest(userId: string): Promise<FriendListResponse> {
    const { data } = await apiClient.delete<FriendListResponse>(`${FRIEND_BASE}/requests/${userId}`)
    return data
  },
  async removeFriend(userId: string): Promise<FriendListResponse> {
    const { data } = await apiClient.delete<FriendListResponse>(`${FRIEND_BASE}/${userId}`)
    return data
  },
  getErrorMessage(error: unknown): string {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
