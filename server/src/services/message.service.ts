import { Types } from 'mongoose'
import { ConversationModel } from '../models/conversation.model'
import { MessageModel } from '../models/message.model'
import { UserModel } from '../models/user.model'
import type { ConversationSummary, ChatMessage } from '../types/message'
import type { AuthenticatedUser } from '../types/user'
import { ApiError } from '../utils/api-error'
import { isUserOnline, getIo } from '../socket'
import { mediaService } from './media.service'
import { notificationService } from './notification.service'

export const messageService = {
  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const conversations = await ConversationModel.find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'name email avatarUrl')
      .sort({ lastMessageAt: -1, updatedAt: -1 })

    return conversations.map((conversation: any) => ({
      id: conversation.id,
      participants: conversation.participants.map(mapUser),
      lastMessageText: conversation.lastMessageText ?? null,
      lastMessageAt: conversation.lastMessageAt ? conversation.lastMessageAt.toISOString() : null,
    }))
  },

  async openConversation(user: AuthenticatedUser, otherUserId: string) {
    if (user.id === otherUserId) {
      throw new ApiError(400, 'You cannot message yourself.')
    }

    const [currentUser, otherUser] = await Promise.all([UserModel.findById(user.id), UserModel.findById(otherUserId)])
    if (!currentUser || !otherUser) {
      throw new ApiError(404, 'User not found.')
    }

    if (!currentUser.friends.some((id) => id.toString() === otherUserId)) {
      throw new ApiError(403, 'You can only message friends right now.')
    }

    const participantIds = [new Types.ObjectId(user.id), new Types.ObjectId(otherUserId)]

    let conversation = await ConversationModel.findOne({
      participants: { $all: participantIds, $size: 2 },
    }).populate('participants', 'name email avatarUrl')

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: participantIds,
      })
      conversation = await ConversationModel.findById(conversation._id).populate('participants', 'name email avatarUrl')
    }

    if (!conversation) {
      throw new ApiError(500, 'Unable to open conversation.')
    }

    return {
      id: conversation.id,
      participants: (conversation as any).participants.map(mapUser),
      lastMessageText: conversation.lastMessageText ?? null,
      lastMessageAt: conversation.lastMessageAt ? conversation.lastMessageAt.toISOString() : null,
    } satisfies ConversationSummary
  },

  async getMessages(userId: string, conversationId: string): Promise<ChatMessage[]> {
    await ensureParticipant(userId, conversationId)

    const messages = await MessageModel.find({ conversation: conversationId })
      .populate('sender', 'name email avatarUrl')
      .sort({ createdAt: 1 })

    await this.markConversationSeen(userId, conversationId)

    return messages.map((message: any) => mapMessage(message))
  },

  async sendMessage(user: AuthenticatedUser, payload: { conversationId: string; text?: string; image?: Express.Multer.File }) {
    const conversation = await ensureParticipant(user.id, payload.conversationId)
    const otherParticipantId = conversation.participants.find((id) => id.toString() !== user.id)?.toString()

    let uploadedImage: { url: string; publicId: string } | null = null
    if (payload.image) {
      uploadedImage = await mediaService.uploadImage(payload.image, 'messages', `message-${user.id}-${Date.now()}`)
    }

    const text = payload.text?.trim() || null
    if (!text && !uploadedImage) {
      throw new ApiError(400, 'Message content is required.')
    }

    const initialStatus = otherParticipantId && isUserOnline(otherParticipantId) ? 'delivered' : 'sent'

    const message = await MessageModel.create({
      conversation: conversation._id,
      sender: new Types.ObjectId(user.id),
      text,
      imageUrl: uploadedImage?.url ?? null,
      imagePublicId: uploadedImage?.publicId ?? null,
      status: initialStatus,
    })

    conversation.lastMessageText = text ?? 'Sent an image'
    conversation.lastMessageAt = new Date()
    await conversation.save()

    const populatedMessage = await MessageModel.findById(message._id).populate('sender', 'name email avatarUrl')
    if (!populatedMessage) {
      throw new ApiError(500, 'Unable to load message.')
    }

    const mapped = mapMessage(populatedMessage as any)
    const io = getIo()
    io.to(`conversation:${conversation.id}`).emit('message:new', mapped)

    if (otherParticipantId) {
      await notificationService.create({
        recipientId: otherParticipantId,
        actorId: user.id,
        type: 'message_received',
        title: 'New message',
        body: text ? `${user.name}: ${text.slice(0, 80)}` : `${user.name} sent you an image.`,
        entityId: conversation.id,
        entityType: 'conversation',
      })
    }

    return mapped
  },

  async markConversationSeen(userId: string, conversationId: string) {
    const conversation = await ensureParticipant(userId, conversationId)
    const unseen = await MessageModel.find({
      conversation: conversation._id,
      sender: { $ne: new Types.ObjectId(userId) },
      status: { $ne: 'seen' },
    }).populate('sender', 'name email avatarUrl')

    if (unseen.length === 0) {
      return
    }

    await MessageModel.updateMany(
      { _id: { $in: unseen.map((message) => message._id) } },
      { $set: { status: 'seen', seenAt: new Date() } },
    )

    const io = getIo()
    unseen.forEach((message: any) => {
      io.to(`conversation:${conversationId}`).emit('message:status', {
        messageId: message.id,
        conversationId,
        status: 'seen',
        seenAt: new Date().toISOString(),
      })
    })
  },
}

async function ensureParticipant(userId: string, conversationId: string) {
  const conversation = await ConversationModel.findById(conversationId)
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found.')
  }

  if (!conversation.participants.some((id) => id.toString() === userId)) {
    throw new ApiError(403, 'You are not part of this conversation.')
  }

  return conversation
}

function mapUser(user: any): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
  }
}

function mapMessage(message: any): ChatMessage {
  return {
    id: message.id,
    conversationId: message.conversation.toString(),
    sender: mapUser(message.sender),
    text: message.text ?? null,
    imageUrl: message.imageUrl ?? null,
    status: message.status,
    seenAt: message.seenAt ? message.seenAt.toISOString() : null,
    createdAt: message.createdAt.toISOString(),
  }
}
