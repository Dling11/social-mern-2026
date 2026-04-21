import type { AuthUser } from './auth'

export interface ConversationSummary {
  id: string
  participants: AuthUser[]
  lastMessageText?: string | null
  lastMessageAt?: string | null
  unreadCount: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  sender: AuthUser
  text?: string | null
  imageUrl?: string | null
  status: 'sent' | 'delivered' | 'seen'
  seenAt?: string | null
  createdAt: string
}
