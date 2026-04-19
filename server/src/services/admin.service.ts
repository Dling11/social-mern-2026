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
    const user = await UserModel.findByIdAndUpdate(userId, { role }, { new: true })
    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    return {
      id: user.id,
      name: user.name,
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
}
