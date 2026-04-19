import type { AuthenticatedUser } from './user'

export interface ChatMessage {
  id: string
  conversationId: string
  sender: AuthenticatedUser
  text?: string | null
  imageUrl?: string | null
  status: 'sent' | 'delivered' | 'seen'
  seenAt?: string | null
  createdAt: string
}

export interface ConversationSummary {
  id: string
  participants: AuthenticatedUser[]
  lastMessageText?: string | null
  lastMessageAt?: string | null
}
