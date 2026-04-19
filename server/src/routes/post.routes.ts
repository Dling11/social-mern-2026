import { Router } from 'express'
import { postController } from '../controllers/post.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const postRouter = Router()

postRouter.use(requireAuth)
postRouter.get('/', postController.getFeed)
postRouter.post('/', postController.createPost)
postRouter.post('/:postId/likes', postController.toggleLike)
postRouter.post('/:postId/comments', postController.addComment)
