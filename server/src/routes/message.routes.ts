import { Router } from 'express'
import { upload } from '../config/upload'
import { messageController } from '../controllers/message.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const messageRouter = Router()

messageRouter.use(requireAuth)
messageRouter.get('/conversations', messageController.getConversations)
messageRouter.post('/conversations', messageController.openConversation)
messageRouter.get('/conversations/:conversationId/messages', messageController.getMessages)
messageRouter.post('/conversations/:conversationId/messages', upload.single('image'), messageController.sendMessage)
messageRouter.post('/conversations/:conversationId/seen', messageController.markSeen)
