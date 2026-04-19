import { Router } from 'express'
import { adminRouter } from './admin.routes'
import { authRouter } from './auth.routes'
import { friendRouter } from './friend.routes'
import { messageRouter } from './message.routes'
import { notificationRouter } from './notification.routes'
import { postRouter } from './post.routes'
import { profileRouter } from './profile.routes'
import { userRouter } from './user.routes'

export const apiRouter = Router()

apiRouter.use('/admin', adminRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/friends', friendRouter)
apiRouter.use('/messages', messageRouter)
apiRouter.use('/notifications', notificationRouter)
apiRouter.use('/posts', postRouter)
apiRouter.use('/profiles', profileRouter)
apiRouter.use('/users', userRouter)
