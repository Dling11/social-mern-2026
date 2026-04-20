import bcrypt from 'bcryptjs'
import type { CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { UserModel } from '../models/user.model'
import type { AuthenticatedUser } from '../types/user'
import { ApiError } from '../utils/api-error'

interface RegisterPayload {
  firstName: string
  lastName: string
  middleName?: string
  username: string
  email: string
  password: string
}

interface LoginPayload {
  identifier: string
  password: string
}

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const authService = {
  async register(payload: RegisterPayload) {
    const normalizedEmail = payload.email.toLowerCase()
    const normalizedUsername = payload.username.toLowerCase()
    const existingUser = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    })
    if (existingUser?.email === normalizedEmail) {
      throw new ApiError(409, 'An account with this email already exists.')
    }
    if (existingUser?.username === normalizedUsername) {
      throw new ApiError(409, 'That username is already taken.')
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12)
    const displayName = [payload.firstName, payload.middleName?.trim(), payload.lastName].filter(Boolean).join(' ')
    const user = await UserModel.create({
      name: displayName,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      middleName: payload.middleName?.trim() || null,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: env.ADMIN_EMAIL_LIST.includes(normalizedEmail) ? 'admin' : 'user',
    })

    return {
      user: mapUser(user),
      token: createToken(user.id),
    }
  },

  async login(payload: LoginPayload) {
    const normalizedIdentifier = payload.identifier.toLowerCase()
    const user = await UserModel.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    }).select('+password')
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.')
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password)
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.')
    }

    return {
      user: mapUser(user),
      token: createToken(user.id),
    }
  },

  async changePassword(userId: string, payload: ChangePasswordPayload) {
    const user = await UserModel.findById(userId).select('+password')
    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    const isCurrentPasswordValid = await bcrypt.compare(payload.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new ApiError(400, 'Current password is incorrect.')
    }

    const isSamePassword = await bcrypt.compare(payload.newPassword, user.password)
    if (isSamePassword) {
      throw new ApiError(400, 'Choose a new password different from your current one.')
    }

    user.password = await bcrypt.hash(payload.newPassword, 12)
    await user.save()
  },

  async getUserFromToken(token: string) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload
      const user = await UserModel.findById(payload.sub)

      if (!user) {
        throw new ApiError(401, 'Session is no longer valid.')
      }

      return mapUser(user)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(401, 'Invalid or expired session.')
    }
  },

  getAuthCookieOptions(): CookieOptions {
    const isProduction = env.NODE_ENV === 'production'

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    }
  },
}

function createToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

function mapUser(user: {
  id: string
  name: string
  firstName?: string
  lastName?: string
  middleName?: string | null
  username?: string | null
  bio?: string | null
  avatarCaption?: string | null
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
  coverUrl?: string | null
}): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName ?? null,
    username: user.username ?? null,
    bio: user.bio ?? null,
    avatarCaption: user.avatarCaption ?? null,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    coverUrl: user.coverUrl ?? null,
  }
}
