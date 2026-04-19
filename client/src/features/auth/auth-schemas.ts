import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter your email or username.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters.').max(30, 'First name is too long.'),
    middleName: z.string().max(30, 'Middle name is too long.').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters.').max(30, 'Last name is too long.'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .max(30, 'Username is too long.')
      .regex(/^[a-zA-Z0-9._]+$/, 'Use only letters, numbers, dots, and underscores.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmNewPassword: z.string().min(6, 'Please confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from your current password.',
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
