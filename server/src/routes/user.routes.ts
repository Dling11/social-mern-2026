import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const userRouter = Router()

userRouter.use(requireAuth)
userRouter.get('/search', userController.search)
