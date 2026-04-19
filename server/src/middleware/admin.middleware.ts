import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/api-error'

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {
  if (request.user?.role !== 'admin') {
    next(new ApiError(403, 'Admin access required.'))
    return
  }

  next()
}
