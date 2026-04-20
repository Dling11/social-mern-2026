import { z } from 'zod'

export const updateAvatarSchema = z.object({
  caption: z.string().max(180, 'Description must be 180 characters or fewer.').optional(),
})

export type UpdateAvatarValues = z.infer<typeof updateAvatarSchema>
