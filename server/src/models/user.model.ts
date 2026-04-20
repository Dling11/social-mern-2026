import { Schema, Types, model } from 'mongoose'

export interface UserDocument {
  name: string
  firstName: string
  lastName: string
  middleName?: string | null
  username?: string | null
  bio?: string | null
  avatarCaption?: string | null
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
    avatarCaption: {
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

userSchema.pre('validate', function () {
  const currentName = this.name?.trim() || ''
  const emailLocalPart = this.email?.split('@')[0]?.trim() || 'member'
  const fallbackSource = currentName || emailLocalPart
  const parts = fallbackSource
    .split(/[._\s-]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const normalizedFirstName = this.firstName?.trim() || parts[0] || 'Member'
  const normalizedLastName = this.lastName?.trim() || parts[1] || 'User'

  if (!this.firstName) {
    this.firstName = ensureMinLength(capitalize(normalizedFirstName))
  }

  if (!this.lastName) {
    this.lastName = ensureMinLength(capitalize(normalizedLastName))
  }

  if (!this.name || !this.name.trim()) {
    this.name = [this.firstName, this.middleName?.trim(), this.lastName].filter(Boolean).join(' ')
  }
})

function capitalize(value: string) {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function ensureMinLength(value: string) {
  if (value.length >= 2) {
    return value
  }

  return `${value}x`
}

export const UserModel = model<UserDocument>('User', userSchema)
