import type { AuthUser } from './auth'

export interface AppNotification {
  id: string
  recipientId: string
  actor: AuthUser
  type: 'friend_request_received' | 'friend_request_accepted' | 'post_liked' | 'post_commented' | 'message_received'
  title: string
  body: string
  entityId?: string | null
  entityType?: string | null
  isRead: boolean
  createdAt: string
}
