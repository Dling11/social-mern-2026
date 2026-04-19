import type { Request, Response } from 'express'
import { z } from 'zod'
import { postService } from '../services/post.service'

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(1200),
  imageUrl: z.string().url().nullable().optional(),
})

const addCommentSchema = z.object({
  content: z.string().trim().min(1).max(500),
})

export const postController = {
  async getFeed(request: Request, response: Response) {
    const posts = await postService.getFeed(request.user!.id)
    response.status(200).json({ posts })
  },

  async createPost(request: Request, response: Response) {
    const payload = createPostSchema.parse(request.body)
    const post = await postService.createPost(request.user!, payload)
    response.status(201).json({ post })
  },

  async toggleLike(request: Request, response: Response) {
    const post = await postService.toggleLike(String(request.params.postId), request.user!)
    response.status(200).json({ post })
  },

  async addComment(request: Request, response: Response) {
    const payload = addCommentSchema.parse(request.body)
    const post = await postService.addComment(String(request.params.postId), request.user!, payload)
    response.status(201).json({ post })
  },
}
