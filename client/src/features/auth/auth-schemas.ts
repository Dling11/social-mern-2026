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

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
