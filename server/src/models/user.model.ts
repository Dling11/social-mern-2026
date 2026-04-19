import { Schema, model } from 'mongoose'

export interface UserDocument {
  name: string
  email: string
  password: string
  avatarUrl?: string | null
  coverUrl?: string | null
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
    coverUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export const UserModel = model<UserDocument>('User', userSchema)
