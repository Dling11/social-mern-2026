import { Router } from 'express'
import { authRouter } from './auth.routes'
import { friendRouter } from './friend.routes'
import { postRouter } from './post.routes'
import { profileRouter } from './profile.routes'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/friends', friendRouter)
apiRouter.use('/posts', postRouter)
apiRouter.use('/profiles', profileRouter)
