import { Types } from 'mongoose'
import { PostModel } from '../models/post.model'
import type { AuthenticatedUser } from '../types/user'
import type { FeedAuthor, FeedComment, FeedPost } from '../types/post'
import { ApiError } from '../utils/api-error'
import { mediaService } from './media.service'

interface CreatePostPayload {
  content: string
  image?: Express.Multer.File
}

interface AddCommentPayload {
  content: string
}

const FEED_POPULATE = [
  {
    path: 'author',
    select: 'name email avatarUrl',
  },
  {
    path: 'comments.user',
    select: 'name email avatarUrl',
  },
]

export const postService = {
  async getFeed(currentUserId: string) {
    const posts = await PostModel.find()
      .populate(FEED_POPULATE)
      .sort({ createdAt: -1 })
      .limit(25)

    return posts.map((post) => mapPost(post, currentUserId))
  },

  async getPostsByAuthor(authorId: string, currentUserId: string) {
    const posts = await PostModel.find({ author: authorId })
      .populate(FEED_POPULATE)
      .sort({ createdAt: -1 })
      .limit(25)

    return posts.map((post) => mapPost(post, currentUserId))
  },

  async createPost(user: AuthenticatedUser, payload: CreatePostPayload) {
    let uploadedImage: { url: string; publicId: string } | null = null

    if (payload.image) {
      uploadedImage = await mediaService.uploadImage(payload.image, 'posts', `post-${user.id}-${Date.now()}`)
    }

    const post = await PostModel.create({
      author: new Types.ObjectId(user.id),
      content: payload.content,
      imageUrl: uploadedImage?.url ?? null,
      imagePublicId: uploadedImage?.publicId ?? null,
      likes: [],
      comments: [],
    })

    const populatedPost = await PostModel.findById(post._id).populate(FEED_POPULATE)
    if (!populatedPost) {
      throw new ApiError(404, 'Post could not be loaded after creation.')
    }

    return mapPost(populatedPost, user.id)
  },

  async toggleLike(postId: string, user: AuthenticatedUser) {
    const post = await PostModel.findById(postId)
    if (!post) {
      throw new ApiError(404, 'Post not found.')
    }

    const hasLiked = post.likes.some((likeId) => likeId.toString() === user.id)
    if (hasLiked) {
      post.likes = post.likes.filter((likeId) => likeId.toString() !== user.id)
    } else {
      post.likes.push(new Types.ObjectId(user.id))
    }

    await post.save()

    const populatedPost = await PostModel.findById(post._id).populate(FEED_POPULATE)
    if (!populatedPost) {
      throw new ApiError(404, 'Post not found.')
    }

    return mapPost(populatedPost, user.id)
  },

  async addComment(postId: string, user: AuthenticatedUser, payload: AddCommentPayload) {
    const post = await PostModel.findById(postId)
    if (!post) {
      throw new ApiError(404, 'Post not found.')
    }

    post.comments.push({
      user: new Types.ObjectId(user.id),
      content: payload.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await post.save()

    const populatedPost = await PostModel.findById(post._id).populate(FEED_POPULATE)
    if (!populatedPost) {
      throw new ApiError(404, 'Post not found.')
    }

    return mapPost(populatedPost, user.id)
  },
}

function mapPost(post: any, currentUserId: string): FeedPost {
  const likes = Array.isArray(post.likes) ? post.likes : []
  const comments = Array.isArray(post.comments) ? post.comments : []

  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likeCount: likes.length,
    commentCount: comments.length,
    isLiked: likes.some((like: Types.ObjectId) => like.toString() === currentUserId),
    author: mapAuthor(post.author),
    comments: comments.map((comment: any) => mapComment(comment)),
  }
}

function mapAuthor(author: any): FeedAuthor {
  return {
    id: author.id,
    name: author.name,
    email: author.email,
    avatarUrl: author.avatarUrl ?? null,
  }
}

function mapComment(comment: any): FeedComment {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: mapAuthor(comment.user),
  }
}
