import bcrypt from 'bcryptjs'
import type { CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { UserModel } from '../models/user.model'
import type { AuthenticatedUser } from '../types/user'
import { ApiError } from '../utils/api-error'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  async register(payload: RegisterPayload) {
    const existingUser = await UserModel.findOne({ email: payload.email.toLowerCase() })
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.')
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12)
    const normalizedEmail = payload.email.toLowerCase()
    const user = await UserModel.create({
      ...payload,
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
    const user = await UserModel.findOne({ email: payload.email.toLowerCase() }).select('+password')
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

function mapUser(user: { id: string; name: string; email: string; role: 'user' | 'admin'; avatarUrl?: string | null }): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
  }
}
