import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const notificationRouter = Router()

notificationRouter.use(requireAuth)
notificationRouter.get('/', notificationController.getNotifications)
notificationRouter.post('/read-all', notificationController.markAllRead)
notificationRouter.post('/:notificationId/read', notificationController.markRead)
