import type { Request, Response } from 'express'
import { z } from 'zod'
import { UserModel } from '../models/user.model'

const searchSchema = z.object({
  q: z.string().trim().min(1),
})

export const userController = {
  async search(request: Request, response: Response) {
    const { q } = searchSchema.parse(request.query)
    const currentUserId = request.user?.id
    const users = await UserModel.find({
      ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .select('name firstName lastName username email role avatarUrl coverUrl')
      .limit(12)

    response.status(200).json({
      users: users.map((user: any) => ({
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username ?? null,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        coverUrl: user.coverUrl ?? null,
      })),
    })
  },
}
