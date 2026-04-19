import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
