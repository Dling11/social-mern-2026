import { Schema, Types, model } from 'mongoose'

export type NotificationType =
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'post_liked'
  | 'post_commented'
  | 'message_received'

export interface NotificationDocument {
  recipient: Types.ObjectId
  actor: Types.ObjectId
  type: NotificationType
  title: string
  body: string
  entityId?: string | null
  entityType?: string | null
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['friend_request_received', 'friend_request_accepted', 'post_liked', 'post_commented', 'message_received'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    entityType: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

notificationSchema.index({ recipient: 1, createdAt: -1 })

export const NotificationModel = model<NotificationDocument>('Notification', notificationSchema)
