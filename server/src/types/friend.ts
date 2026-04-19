export type FriendshipStatus = 'self' | 'friends' | 'incoming_request' | 'outgoing_request' | 'none'

export interface FriendSummary {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string | null
}

export interface FriendListResponse {
  friends: FriendSummary[]
  receivedRequests: FriendSummary[]
  sentRequests: FriendSummary[]
}
