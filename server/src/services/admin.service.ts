import bcrypt from 'bcryptjs'
import { ConversationModel } from '../models/conversation.model'
import { NotificationModel } from '../models/notification.model'
import { PostModel } from '../models/post.model'
import { UserModel } from '../models/user.model'
import type { AdminPostRow, AdminStats, AdminUserRow } from '../types/admin'
import { ApiError } from '../utils/api-error'

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const [totalUsers, totalPosts, totalConversations, totalNotifications] = await Promise.all([
      UserModel.countDocuments(),
      PostModel.countDocuments(),
      ConversationModel.countDocuments(),
      NotificationModel.countDocuments(),
    ])

    return {
      totalUsers,
      totalPosts,
      totalConversations,
      totalNotifications,
    }
  },

  async getUsers(): Promise<AdminUserRow[]> {
    const users = await UserModel.find().sort({ createdAt: -1 })
    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      username: user.username ?? null,
      email: user.email,
      role: user.role,
      postCount: 0,
      friendCount: user.friends?.length ?? 0,
      createdAt: user.createdAt.toISOString(),
    }))
  },

  async getPosts(): Promise<AdminPostRow[]> {
    const posts = await PostModel.find().populate('author', 'name email').sort({ createdAt: -1 }).limit(100)

    return posts.map((post: any) => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl ?? null,
      authorName: post.author?.name ?? 'Unknown',
      authorEmail: post.author?.email ?? 'Unknown',
      likeCount: post.likes?.length ?? 0,
      commentCount: post.comments?.length ?? 0,
      createdAt: post.createdAt.toISOString(),
    }))
  },

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    const adminCount = await UserModel.countDocuments({ role: 'admin' })

    if (role === user.role) {
      return {
        id: user.id,
        name: user.name,
        username: user.username ?? null,
        email: user.email,
        role: user.role,
        postCount: 0,
        friendCount: user.friends?.length ?? 0,
        createdAt: user.createdAt.toISOString(),
      }
    }

    if (role === 'admin') {
      const existingOtherAdmin = await UserModel.findOne({ role: 'admin', _id: { $ne: userId } })
      if (existingOtherAdmin) {
        throw new ApiError(409, 'Only one admin account is allowed.')
      }
    }

    if (role === 'user' && user.role === 'admin' && adminCount <= 1) {
      throw new ApiError(409, 'At least one admin account must remain.')
    }

    user.role = role
    await user.save()

    return {
      id: user.id,
      name: user.name,
      username: user.username ?? null,
      email: user.email,
      role: user.role,
      postCount: 0,
      friendCount: user.friends?.length ?? 0,
      createdAt: user.createdAt.toISOString(),
    }
  },

  async deletePost(postId: string) {
    const post = await PostModel.findByIdAndDelete(postId)
    if (!post) {
      throw new ApiError(404, 'Post not found.')
    }

    return { success: true }
  },

  async deleteUser(userId: string) {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    if (user.role === 'admin') {
      throw new ApiError(409, 'Admin account cannot be deleted from this panel.')
    }

    await UserModel.findByIdAndDelete(userId)
    return { success: true }
  },

  async resetUserPassword(userId: string, password: string) {
    const user = await UserModel.findById(userId).select('+password')
    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    user.password = await bcrypt.hash(password, 12)
    await user.save()

    return { success: true }
  },
}
