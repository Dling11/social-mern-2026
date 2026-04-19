import { UserModel } from '../models/user.model'
import { PostModel } from '../models/post.model'
import type { FriendshipStatus } from '../types/friend'
import type { AuthenticatedUser } from '../types/user'
import { ApiError } from '../utils/api-error'
import { mediaService } from './media.service'
import { friendService } from './friend.service'

export interface ProfileResponse {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  coverUrl?: string | null
  postCount: number
  friendCount: number
  friendshipStatus: FriendshipStatus
}

export const profileService = {
  async getProfile(userId: string, viewerId: string): Promise<ProfileResponse> {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(404, 'Profile not found.')
    }

    const postCount = await PostModel.countDocuments({ author: user._id })
    const friendshipStatus = await friendService.getRelationshipStatus(viewerId, userId)
    return mapProfile(user, postCount, friendshipStatus)
  },

  async updateAvatar(user: AuthenticatedUser, file: Express.Multer.File) {
    const existingUser = await UserModel.findById(user.id)
    if (!existingUser) {
      throw new ApiError(404, 'Profile not found.')
    }

    const uploaded = await mediaService.uploadImage(file, 'profiles/avatars', `avatar-${existingUser.id}`)
    await mediaService.destroy(existingUser.avatarPublicId)

    existingUser.avatarUrl = uploaded.url
    existingUser.avatarPublicId = uploaded.publicId
    await existingUser.save()

    return mapProfile(existingUser, await PostModel.countDocuments({ author: existingUser._id }), 'self')
  },

  async updateCover(user: AuthenticatedUser, file: Express.Multer.File) {
    const existingUser = await UserModel.findById(user.id)
    if (!existingUser) {
      throw new ApiError(404, 'Profile not found.')
    }

    const uploaded = await mediaService.uploadImage(file, 'profiles/covers', `cover-${existingUser.id}`)
    await mediaService.destroy(existingUser.coverPublicId)

    existingUser.coverUrl = uploaded.url
    existingUser.coverPublicId = uploaded.publicId
    await existingUser.save()

    return mapProfile(existingUser, await PostModel.countDocuments({ author: existingUser._id }), 'self')
  },
}

function mapProfile(user: {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  coverUrl?: string | null
  friends?: unknown[]
}, postCount: number, friendshipStatus: FriendshipStatus): ProfileResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    coverUrl: user.coverUrl ?? null,
    postCount,
    friendCount: Array.isArray(user.friends) ? user.friends.length : 0,
    friendshipStatus,
  }
}
