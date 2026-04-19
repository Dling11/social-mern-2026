import { Types } from 'mongoose'
import { NotificationModel, type NotificationType } from '../models/notification.model'
import { getIo } from '../socket'
import type { AppNotification } from '../types/notification'

interface CreateNotificationInput {
  recipientId: string
  actorId: string
  type: NotificationType
  title: string
  body: string
  entityId?: string | null
  entityType?: string | null
}

export const notificationService = {
  async create(input: CreateNotificationInput) {
    if (input.recipientId === input.actorId) {
      return null
    }

    const notification = await NotificationModel.create({
      recipient: new Types.ObjectId(input.recipientId),
      actor: new Types.ObjectId(input.actorId),
      type: input.type,
      title: input.title,
      body: input.body,
      entityId: input.entityId ?? null,
      entityType: input.entityType ?? null,
      isRead: false,
    })

    const populated = await NotificationModel.findById(notification._id).populate('actor', 'name email avatarUrl role')
    if (!populated) {
      return null
    }

    const mapped = mapNotification(populated as any)
    getIo().to(`user:${input.recipientId}`).emit('notification:new', mapped)
    return mapped
  },

  async getForUser(userId: string) {
    const notifications = await NotificationModel.find({ recipient: userId })
      .populate('actor', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50)

    return notifications.map((notification: any) => mapNotification(notification))
  },

  async markAllRead(userId: string) {
    await NotificationModel.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true } })
  },

  async markRead(userId: string, notificationId: string) {
    await NotificationModel.updateOne({ _id: notificationId, recipient: userId }, { $set: { isRead: true } })
  },
}

function mapNotification(notification: any): AppNotification {
  return {
    id: notification.id,
    recipientId: notification.recipient.toString(),
    actor: {
      id: notification.actor.id,
      name: notification.actor.name,
      email: notification.actor.email,
      role: notification.actor.role ?? 'user',
      avatarUrl: notification.actor.avatarUrl ?? null,
    },
    type: notification.type,
    title: notification.title,
    body: notification.body,
    entityId: notification.entityId ?? null,
    entityType: notification.entityType ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  }
}
