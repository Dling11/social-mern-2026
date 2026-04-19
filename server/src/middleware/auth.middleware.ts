import type { NextFunction, Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { ApiError } from '../utils/api-error'

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.cookies.token

    if (!token) {
      throw new ApiError(401, 'Authentication required.')
    }

    request.user = await authService.getUserFromToken(token)
    next()
  } catch (error) {
    next(error)
  }
}
