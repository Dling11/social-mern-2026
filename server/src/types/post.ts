export interface FeedAuthor {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export interface FeedComment {
  id: string
  content: string
  createdAt: string
  author: FeedAuthor
}

export interface FeedPost {
  id: string
  type: 'standard' | 'avatar_update'
  content: string
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  isLiked: boolean
  author: FeedAuthor
  comments: FeedComment[]
}
