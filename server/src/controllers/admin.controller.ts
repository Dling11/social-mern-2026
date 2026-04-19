import type { Request, Response } from 'express'
import { z } from 'zod'
import { adminService } from '../services/admin.service'

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
})

const resetPasswordSchema = z.object({
  password: z.string().min(6),
})

export const adminController = {
  async getStats(_request: Request, response: Response) {
    const stats = await adminService.getStats()
    response.status(200).json({ stats })
  },

  async getUsers(_request: Request, response: Response) {
    const users = await adminService.getUsers()
    response.status(200).json({ users })
  },

  async getPosts(_request: Request, response: Response) {
    const posts = await adminService.getPosts()
    response.status(200).json({ posts })
  },

  async updateUserRole(request: Request, response: Response) {
    const payload = updateRoleSchema.parse(request.body)
    const user = await adminService.updateUserRole(String(request.params.userId), payload.role)
    response.status(200).json({ user })
  },

  async deletePost(request: Request, response: Response) {
    const result = await adminService.deletePost(String(request.params.postId))
    response.status(200).json(result)
  },

  async deleteUser(request: Request, response: Response) {
    const result = await adminService.deleteUser(String(request.params.userId))
    response.status(200).json(result)
  },

  async resetUserPassword(request: Request, response: Response) {
    const payload = resetPasswordSchema.parse(request.body)
    const result = await adminService.resetUserPassword(String(request.params.userId), payload.password)
    response.status(200).json(result)
  },
}
