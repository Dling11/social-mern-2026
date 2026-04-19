import multer from 'multer'
import { env } from './env'
import { ApiError } from '../utils/api-error'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, 'Only JPG, PNG, and WEBP images are supported.'))
      return
    }

    callback(null, true)
  },
})
