export type MediaFolder = 'posts' | 'messages' | 'profiles/avatars' | 'profiles/covers'

export interface UploadedMedia {
  url: string
  publicId: string
}
