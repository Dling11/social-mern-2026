import type { Request, Response } from 'express'
import { notificationService } from '../services/notification.service'

export const notificationController = {
  async getNotifications(request: Request, response: Response) {
    const notifications = await notificationService.getForUser(request.user!.id)
    response.status(200).json({ notifications })
  },

  async markAllRead(request: Request, response: Response) {
    await notificationService.markAllRead(request.user!.id)
    response.status(200).json({ success: true })
  },

  async markRead(request: Request, response: Response) {
    await notificationService.markRead(request.user!.id, String(request.params.notificationId))
    response.status(200).json({ success: true })
  },
}
