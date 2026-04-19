import type { AuthUser } from './auth'

export type FriendshipStatus = 'self' | 'friends' | 'incoming_request' | 'outgoing_request' | 'none'

export interface FriendListResponse {
  friends: AuthUser[]
  receivedRequests: AuthUser[]
  sentRequests: AuthUser[]
}
