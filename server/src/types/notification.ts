import type { AuthenticatedUser } from './user'
import type { NotificationType } from '../models/notification.model'

export interface AppNotification {
  id: string
  recipientId: string
  actor: AuthenticatedUser
  type: NotificationType
  title: string
  body: string
  entityId?: string | null
  entityType?: string | null
  isRead: boolean
  createdAt: string
}
