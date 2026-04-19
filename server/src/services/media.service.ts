import { Readable } from 'node:stream'
import { cloudinary } from '../config/cloudinary'
import type { MediaFolder, UploadedMedia } from '../types/media'

const BASE_FOLDER = 'social-mern'

export const mediaService = {
  getFolder(folder: MediaFolder) {
    return `${BASE_FOLDER}/${folder}`
  },

  async uploadImage(file: Express.Multer.File, folder: MediaFolder, publicId: string): Promise<UploadedMedia> {
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: this.getFolder(folder),
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error)
            return
          }

          resolve(result)
        },
      )

      Readable.from(file.buffer).pipe(stream)
    })

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }
  },

  async destroy(publicId?: string | null) {
    if (!publicId) {
      return
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })
  },
}
