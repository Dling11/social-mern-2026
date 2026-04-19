import type { Request, Response } from 'express'
import { friendService } from '../services/friend.service'

export const friendController = {
  async getLists(request: Request, response: Response) {
    const data = await friendService.getFriendLists(request.user!.id)
    response.status(200).json(data)
  },

  async sendRequest(request: Request, response: Response) {
    const data = await friendService.sendRequest(request.user!, String(request.params.userId))
    response.status(200).json(data)
  },

  async acceptRequest(request: Request, response: Response) {
    const data = await friendService.acceptRequest(request.user!, String(request.params.userId))
    response.status(200).json(data)
  },

  async declineRequest(request: Request, response: Response) {
    const data = await friendService.declineRequest(request.user!, String(request.params.userId))
    response.status(200).json(data)
  },

  async cancelRequest(request: Request, response: Response) {
    const data = await friendService.cancelRequest(request.user!, String(request.params.userId))
    response.status(200).json(data)
  },

  async removeFriend(request: Request, response: Response) {
    const data = await friendService.removeFriend(request.user!, String(request.params.userId))
    response.status(200).json(data)
  },
}
