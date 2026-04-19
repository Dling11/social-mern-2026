export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalConversations: number
  totalNotifications: number
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  postCount: number
  friendCount: number
  createdAt: string
}

export interface AdminPostRow {
  id: string
  content: string
  imageUrl?: string | null
  authorName: string
  authorEmail: string
  likeCount: number
  commentCount: number
  createdAt: string
}
