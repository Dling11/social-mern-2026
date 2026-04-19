import type { AuthUser } from './auth'
import type { FriendshipStatus } from './friend'

export interface Profile extends AuthUser {
  postCount: number
  friendCount: number
  friendshipStatus: FriendshipStatus
}

export interface ProfileResponse {
  profile: Profile
}
