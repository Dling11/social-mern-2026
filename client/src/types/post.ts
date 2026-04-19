import type { AuthUser } from './auth'

export interface FeedComment {
  id: string
  content: string
  createdAt: string
  author: AuthUser
}

export interface FeedPost {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  isLiked: boolean
  author: AuthUser
  comments: FeedComment[]
}

export interface FeedResponse {
  posts: FeedPost[]
}

export interface SinglePostResponse {
  post: FeedPost
}
