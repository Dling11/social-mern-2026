import { UserModel } from '../models/user.model'
import { PostModel } from '../models/post.model'
import type { FriendshipStatus } from '../types/friend'
import type { AuthenticatedUser } from '../types/user'
import { ApiError } from '../utils/api-error'
import { mediaService } from './media.service'
import { friendService } from './friend.service'
import { postService } from './post.service'

export interface ProfileResponse {
  id: string
  name: string
  username?: string | null
  bio?: string | null
  avatarCaption?: string | null
  createdAt: string
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

  async updateAvatar(user: AuthenticatedUser, payload: { file?: Express.Multer.File; caption?: string | null }) {
    const existingUser = await UserModel.findById(user.id)
    if (!existingUser) {
      throw new ApiError(404, 'Profile not found.')
    }

    if (!payload.file && typeof payload.caption === 'undefined') {
      throw new ApiError(400, 'Profile image or caption is required.')
    }

    if (payload.file) {
      const previousAvatarPublicId = existingUser.avatarPublicId
      const nextCaption = typeof payload.caption !== 'undefined' ? payload.caption?.trim() || null : existingUser.avatarCaption ?? null
      const uploaded = await mediaService.uploadImage(
        payload.file,
        'profiles/avatars',
        `avatar-${existingUser.id}-${Date.now()}`,
      )
      existingUser.avatarUrl = uploaded.url
      existingUser.avatarPublicId = uploaded.publicId
      existingUser.avatarCaption = nextCaption
      await existingUser.save()
      await mediaService.destroy(previousAvatarPublicId)
      await postService.createAvatarUpdatePost(user, {
        caption: nextCaption,
        image: payload.file,
      })
    }

    if (!payload.file && typeof payload.caption !== 'undefined') {
      existingUser.avatarCaption = payload.caption?.trim() ? payload.caption.trim() : null
    }

    if (!payload.file || typeof payload.caption !== 'undefined') {
      await existingUser.save()
    }

    return mapProfile(existingUser, await PostModel.countDocuments({ author: existingUser._id }), 'self')
  },

  async updateCover(user: AuthenticatedUser, file: Express.Multer.File) {
    const existingUser = await UserModel.findById(user.id)
    if (!existingUser) {
      throw new ApiError(404, 'Profile not found.')
    }

    const previousCoverPublicId = existingUser.coverPublicId
    const uploaded = await mediaService.uploadImage(file, 'profiles/covers', `cover-${existingUser.id}-${Date.now()}`)
    existingUser.coverUrl = uploaded.url
    existingUser.coverPublicId = uploaded.publicId
    await existingUser.save()
    await mediaService.destroy(previousCoverPublicId)

    return mapProfile(existingUser, await PostModel.countDocuments({ author: existingUser._id }), 'self')
  },

  async updateProfile(user: AuthenticatedUser, payload: { bio?: string | null }) {
    const existingUser = await UserModel.findById(user.id)
    if (!existingUser) {
      throw new ApiError(404, 'Profile not found.')
    }

    existingUser.bio = payload.bio?.trim() ? payload.bio.trim() : null
    await existingUser.save()

    return mapProfile(existingUser, await PostModel.countDocuments({ author: existingUser._id }), 'self')
  },
}

function mapProfile(user: {
  id: string
  name: string
  username?: string | null
  bio?: string | null
  avatarCaption?: string | null
  createdAt?: Date
  email: string
  avatarUrl?: string | null
  coverUrl?: string | null
  friends?: unknown[]
}, postCount: number, friendshipStatus: FriendshipStatus): ProfileResponse {
  return {
    id: user.id,
    name: user.name,
    username: user.username ?? null,
    bio: user.bio ?? null,
    avatarCaption: user.avatarCaption ?? null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    coverUrl: user.coverUrl ?? null,
    postCount,
    friendCount: Array.isArray(user.friends) ? user.friends.length : 0,
    friendshipStatus,
  }
}
