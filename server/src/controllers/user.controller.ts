import type { Request, Response } from 'express'
import { z } from 'zod'
import { UserModel } from '../models/user.model'

const searchSchema = z.object({
  q: z.string().trim().min(1),
})

export const userController = {
  async search(request: Request, response: Response) {
    const { q } = searchSchema.parse(request.query)
    const users = await UserModel.find({
      $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    })
      .select('name email role avatarUrl coverUrl')
      .limit(12)

    response.status(200).json({
      users: users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        coverUrl: user.coverUrl ?? null,
      })),
    })
  },
}
