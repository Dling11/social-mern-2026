import { Schema, Types, model } from 'mongoose'

export type MessageStatus = 'sent' | 'delivered' | 'seen'

export interface MessageDocument {
  conversation: Types.ObjectId
  sender: Types.ObjectId
  text?: string | null
  imageUrl?: string | null
  imagePublicId?: string | null
  status: MessageStatus
  seenAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<MessageDocument>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

messageSchema.index({ conversation: 1, createdAt: -1 })

export const MessageModel = model<MessageDocument>('Message', messageSchema)
