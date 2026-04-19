import type { AuthenticatedUser } from './user'

export type FriendshipStatus = 'self' | 'friends' | 'incoming_request' | 'outgoing_request' | 'none'

export interface FriendSummary extends AuthenticatedUser {}

export interface FriendListResponse {
  friends: FriendSummary[]
  receivedRequests: FriendSummary[]
  sentRequests: FriendSummary[]
}
