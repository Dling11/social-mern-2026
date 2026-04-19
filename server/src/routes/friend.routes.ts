import { Router } from 'express'
import { friendController } from '../controllers/friend.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const friendRouter = Router()

friendRouter.use(requireAuth)
friendRouter.get('/', friendController.getLists)
friendRouter.post('/requests/:userId', friendController.sendRequest)
friendRouter.post('/requests/:userId/accept', friendController.acceptRequest)
friendRouter.post('/requests/:userId/decline', friendController.declineRequest)
friendRouter.delete('/requests/:userId', friendController.cancelRequest)
friendRouter.delete('/:userId', friendController.removeFriend)
