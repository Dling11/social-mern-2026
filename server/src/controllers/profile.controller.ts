import type { Request, Response } from 'express'
import { profileService } from '../services/profile.service'
import { ApiError } from '../utils/api-error'

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
}
