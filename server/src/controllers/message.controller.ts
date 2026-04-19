import type { Request, Response } from 'express'
import { z } from 'zod'
import { messageService } from '../services/message.service'

const openConversationSchema = z.object({
  userId: z.string().min(1),
})

export const messageController = {
  async getConversations(request: Request, response: Response) {
    const conversations = await messageService.getConversations(request.user!.id)
    response.status(200).json({ conversations })
  },

  async openConversation(request: Request, response: Response) {
    const payload = openConversationSchema.parse(request.body)
    const conversation = await messageService.openConversation(request.user!, payload.userId)
    response.status(200).json({ conversation })
  },

  async getMessages(request: Request, response: Response) {
    const messages = await messageService.getMessages(request.user!.id, String(request.params.conversationId))
    response.status(200).json({ messages })
  },

  async sendMessage(request: Request, response: Response) {
    const message = await messageService.sendMessage(request.user!, {
      conversationId: String(request.params.conversationId),
      text: request.body?.text,
      image: request.file,
    })
    response.status(201).json({ message })
  },

  async markSeen(request: Request, response: Response) {
    await messageService.markConversationSeen(request.user!.id, String(request.params.conversationId))
    response.status(200).json({ success: true })
  },
}
