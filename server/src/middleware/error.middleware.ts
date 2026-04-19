import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/api-error'

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new ApiError(404, 'Route not found.'))
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: error.issues[0]?.message ?? 'Validation failed.',
    })
  }

  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({ message: error.message })
  }

  console.error(error)
  return response.status(500).json({ message: 'Internal server error.' })
}
