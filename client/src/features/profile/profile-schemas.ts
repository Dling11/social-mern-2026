import { z } from 'zod'

export const updateBioSchema = z.object({
  bio: z.string().max(180, 'Bio must be 180 characters or fewer.').optional(),
})

export type UpdateBioValues = z.infer<typeof updateBioSchema>
