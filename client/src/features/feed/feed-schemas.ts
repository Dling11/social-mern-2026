import { z } from 'zod'

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write something to share with your network.')
    .max(1200, 'Post content must be 1200 characters or fewer.'),
})

export const addCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write a comment before posting.')
    .max(500, 'Comments must be 500 characters or fewer.'),
})

export type CreatePostValues = z.infer<typeof createPostSchema>
export type AddCommentValues = z.infer<typeof addCommentSchema>
