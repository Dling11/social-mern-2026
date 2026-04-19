import { Schema, Types, model } from 'mongoose'

export interface UserDocument {
  name: string
  email: string
  password: string
  avatarUrl?: string | null
  avatarPublicId?: string | null
  coverUrl?: string | null
  coverPublicId?: string | null
  friends: Types.ObjectId[]
  sentFriendRequests: Types.ObjectId[]
  receivedFriendRequests: Types.ObjectId[]
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
    coverUrl: {
      type: String,
      default: null,
    },
    coverPublicId: {
      type: String,
      default: null,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sentFriendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    receivedFriendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const UserModel = model<UserDocument>('User', userSchema)
