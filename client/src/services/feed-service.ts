import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { ApiErrorResponse } from '@/types/http'
import type { FeedPost, FeedResponse, SinglePostResponse } from '@/types/post'

const POSTS_BASE = '/posts'

export const feedService = {
  async getFeed(): Promise<FeedPost[]> {
    const { data } = await apiClient.get<FeedResponse>(POSTS_BASE)
    return data.posts
  },
  async createPost(payload: { content: string }): Promise<FeedPost> {
    const { data } = await apiClient.post<SinglePostResponse>(POSTS_BASE, payload)
    return data.post
  },
  async toggleLike(postId: string): Promise<FeedPost> {
    const { data } = await apiClient.post<SinglePostResponse>(`${POSTS_BASE}/${postId}/likes`)
    return data.post
  },
  async addComment(postId: string, payload: { content: string }): Promise<FeedPost> {
    const { data } = await apiClient.post<SinglePostResponse>(`${POSTS_BASE}/${postId}/comments`, payload)
    return data.post
  },
  getErrorMessage(error: unknown): string {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
