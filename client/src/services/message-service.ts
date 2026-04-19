import type { AxiosError } from 'axios'
import { apiClient } from '@/services/api-client'
import type { ApiErrorResponse } from '@/types/http'
import type { ChatMessage, ConversationSummary } from '@/types/message'

export const messageService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const { data } = await apiClient.get<{ conversations: ConversationSummary[] }>('/messages/conversations')
    return data.conversations
  },
  async openConversation(userId: string): Promise<ConversationSummary> {
    const { data } = await apiClient.post<{ conversation: ConversationSummary }>('/messages/conversations', { userId })
    return data.conversation
  },
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<{ messages: ChatMessage[] }>(`/messages/conversations/${conversationId}/messages`)
    return data.messages
  },
  async sendMessage(conversationId: string, payload: { text?: string; image?: File | null }) {
    const formData = new FormData()
    if (payload.text) {
      formData.append('text', payload.text)
    }
    if (payload.image) {
      formData.append('image', payload.image)
    }

    const { data } = await apiClient.post<{ message: ChatMessage }>(
      `/messages/conversations/${conversationId}/messages`,
      formData,
    )
    return data.message
  },
  async markSeen(conversationId: string) {
    await apiClient.post(`/messages/conversations/${conversationId}/seen`)
  },
  getErrorMessage(error: unknown) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.'
  },
}
