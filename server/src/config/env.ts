import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLIENT_URLS: z.string().optional(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET must be at least 24 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  ...parsedEnv,
  CLIENT_ORIGINS: [
    parsedEnv.CLIENT_URL,
    ...(parsedEnv.CLIENT_URLS
      ? parsedEnv.CLIENT_URLS.split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : []),
  ],
}
