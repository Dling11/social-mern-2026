import { Router } from 'express'
import { profileController } from '../controllers/profile.controller'
import { requireAuth } from '../middleware/auth.middleware'
import { upload } from '../config/upload'

export const profileRouter = Router()

profileRouter.use(requireAuth)
profileRouter.get('/me', profileController.getMe)
profileRouter.patch('/me', profileController.updateMe)
profileRouter.get('/:userId', profileController.getById)
profileRouter.post('/me/avatar', upload.single('image'), profileController.updateAvatar)
profileRouter.patch('/me/avatar', upload.single('image'), profileController.updateAvatar)
profileRouter.post('/me/cover', upload.single('image'), profileController.updateCover)
