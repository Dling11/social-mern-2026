import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { ApiErrorResponse } from '@/types/http'
import type { Profile, ProfileResponse } from '@/types/profile'

const PROFILE_BASE = '/profiles'

export const profileService = {
  async getMyProfile(): Promise<Profile> {
    const { data } = await apiClient.get<ProfileResponse>(`${PROFILE_BASE}/me`)
    return data.profile
  },
  async getProfile(userId: string): Promise<Profile> {
    const { data } = await apiClient.get<ProfileResponse>(`${PROFILE_BASE}/${userId}`)
    return data.profile
  },
  async uploadAvatar(file: File): Promise<Profile> {
    const formData = new FormData()
    formData.append('image', file)

    const { data } = await apiClient.post<ProfileResponse>(`${PROFILE_BASE}/me/avatar`, formData)
    return data.profile
  },
  async uploadCover(file: File): Promise<Profile> {
    const formData = new FormData()
    formData.append('image', file)

    const { data } = await apiClient.post<ProfileResponse>(`${PROFILE_BASE}/me/cover`, formData)
    return data.profile
  },
  getErrorMessage(error: unknown): string {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
