import { Schema, Types, model } from 'mongoose'

export interface UserDocument {
  name: string
  firstName: string
  lastName: string
  middleName?: string | null
  username?: string | null
  bio?: string | null
  email: string
  password: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
  avatarPublicId?: string | null
  coverUrl?: string | null
  coverPublicId?: string | null
  friends: Types.ObjectId[]
  sentFriendRequests: Types.ObjectId[]
  receivedFriendRequests: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
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
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: 30,
      default: null,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 180,
      default: null,
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
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
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
