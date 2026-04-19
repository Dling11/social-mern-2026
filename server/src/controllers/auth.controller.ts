import type { Request, Response } from 'express'
import { z } from 'zod'
import { authService } from '../services/auth.service'

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

  async logout(_request: Request, response: Response) {
    response.clearCookie('token', authService.getAuthCookieOptions())
    response.status(200).json({ message: 'Logged out successfully.' })
  },
}
