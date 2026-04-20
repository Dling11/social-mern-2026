import type { Request, Response } from 'express'
import { z } from 'zod'
import { profileService } from '../services/profile.service'
import { ApiError } from '../utils/api-error'

const updateProfileSchema = z.object({
  bio: z.string().trim().max(180).optional().nullable(),
})

export const profileController = {
  async getMe(request: Request, response: Response) {
    const profile = await profileService.getProfile(request.user!.id, request.user!.id)
    response.status(200).json({ profile })
  },

  async getById(request: Request, response: Response) {
    const profile = await profileService.getProfile(String(request.params.userId), request.user!.id)
    response.status(200).json({ profile })
  },

  async updateAvatar(request: Request, response: Response) {
    if (!request.file) {
      throw new ApiError(400, 'Profile image is required.')
    }

    const profile = await profileService.updateAvatar(request.user!, request.file)
    response.status(200).json({ profile })
  },

  async updateCover(request: Request, response: Response) {
    if (!request.file) {
      throw new ApiError(400, 'Cover image is required.')
    }

    const profile = await profileService.updateCover(request.user!, request.file)
    response.status(200).json({ profile })
  },

  async updateMe(request: Request, response: Response) {
    const payload = updateProfileSchema.parse(request.body)
    const profile = await profileService.updateProfile(request.user!, payload)
    response.status(200).json({ profile })
  },
}
