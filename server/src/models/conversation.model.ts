import { Schema, Types, model } from 'mongoose'

export interface ConversationDocument {
  participants: Types.ObjectId[]
  lastMessageText?: string | null
  lastMessageAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessageText: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

conversationSchema.index({ participants: 1 })

export const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema)
