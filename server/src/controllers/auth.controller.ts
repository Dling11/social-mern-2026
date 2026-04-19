import type { Request, Response } from 'express'
import { z } from 'zod'
import { authService } from '../services/auth.service'
import { ApiError } from '../utils/api-error'

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(30),
  lastName: z.string().trim().min(2).max(30),
  middleName: z.string().trim().max(30).optional().or(z.literal('')),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._]+$/),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(6),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

export const authController = {
  async register(request: Request, response: Response) {
    const payload = registerSchema.parse(request.body)
    const result = await authService.register(payload)

    response.cookie('token', result.token, authService.getAuthCookieOptions())
    response.status(201).json({ user: result.user })
  },

  async login(request: Request, response: Response) {
    const payload = loginSchema.parse(request.body)
    const result = await authService.login(payload)

    response.cookie('token', result.token, authService.getAuthCookieOptions())
    response.status(200).json({ user: result.user })
  },

  async me(request: Request, response: Response) {
    response.status(200).json({ user: request.user })
  },

  async changePassword(request: Request, response: Response) {
    const payload = changePasswordSchema.parse(request.body)
    if (!request.user) {
      throw new ApiError(401, 'Authentication required.')
    }

    await authService.changePassword(request.user.id, payload)
    response.status(200).json({ message: 'Password updated successfully.' })
  },

  async logout(_request: Request, response: Response) {
    response.clearCookie('token', authService.getAuthCookieOptions())
    response.status(200).json({ message: 'Logged out successfully.' })
  },
}
