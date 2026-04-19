import { UserModel } from '../models/user.model'
import type { FriendListResponse, FriendSummary, FriendshipStatus } from '../types/friend'
import type { AuthenticatedUser } from '../types/user'
import { ApiError } from '../utils/api-error'
import { notificationService } from './notification.service'

export const friendService = {
  async getFriendLists(userId: string): Promise<FriendListResponse> {
    const user = await UserModel.findById(userId)
      .populate('friends', 'name email avatarUrl')
      .populate('receivedFriendRequests', 'name email avatarUrl')
      .populate('sentFriendRequests', 'name email avatarUrl')

    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    return {
      friends: user.friends.map((friend: any) => mapUser(friend)),
      receivedRequests: user.receivedFriendRequests.map((friend: any) => mapUser(friend)),
      sentRequests: user.sentFriendRequests.map((friend: any) => mapUser(friend)),
    }
  },

  async getRelationshipStatus(viewerId: string, targetUserId: string): Promise<FriendshipStatus> {
    if (viewerId === targetUserId) {
      return 'self'
    }

    const viewer = await UserModel.findById(viewerId)
    if (!viewer) {
      throw new ApiError(404, 'Viewer not found.')
    }

    if (viewer.friends.some((id) => id.toString() === targetUserId)) {
      return 'friends'
    }

    if (viewer.receivedFriendRequests.some((id) => id.toString() === targetUserId)) {
      return 'incoming_request'
    }

    if (viewer.sentFriendRequests.some((id) => id.toString() === targetUserId)) {
      return 'outgoing_request'
    }

    return 'none'
  },

  async sendRequest(user: AuthenticatedUser, targetUserId: string) {
    if (user.id === targetUserId) {
      throw new ApiError(400, 'You cannot send a friend request to yourself.')
    }

    const [currentUser, targetUser] = await Promise.all([UserModel.findById(user.id), UserModel.findById(targetUserId)])
    if (!currentUser || !targetUser) {
      throw new ApiError(404, 'User not found.')
    }

    if (currentUser.friends.some((id) => id.toString() === targetUserId)) {
      throw new ApiError(409, 'You are already friends.')
    }

    if (currentUser.sentFriendRequests.some((id) => id.toString() === targetUserId)) {
      throw new ApiError(409, 'Friend request already sent.')
    }

    if (currentUser.receivedFriendRequests.some((id) => id.toString() === targetUserId)) {
      throw new ApiError(409, 'This user already sent you a request. Accept it instead.')
    }

    currentUser.sentFriendRequests.push(targetUser._id)
    targetUser.receivedFriendRequests.push(currentUser._id)
    await Promise.all([currentUser.save(), targetUser.save()])

    await notificationService.create({
      recipientId: targetUser.id,
      actorId: currentUser.id,
      type: 'friend_request_received',
      title: 'New friend request',
      body: `${currentUser.name} sent you a friend request.`,
      entityId: currentUser.id,
      entityType: 'user',
    })

    return this.getFriendLists(user.id)
  },

  async acceptRequest(user: AuthenticatedUser, requesterUserId: string) {
    const [currentUser, requester] = await Promise.all([UserModel.findById(user.id), UserModel.findById(requesterUserId)])
    if (!currentUser || !requester) {
      throw new ApiError(404, 'User not found.')
    }

    const hasRequest = currentUser.receivedFriendRequests.some((id) => id.toString() === requesterUserId)
    if (!hasRequest) {
      throw new ApiError(404, 'Friend request not found.')
    }

    currentUser.receivedFriendRequests = currentUser.receivedFriendRequests.filter((id) => id.toString() !== requesterUserId)
    requester.sentFriendRequests = requester.sentFriendRequests.filter((id) => id.toString() !== user.id)

    if (!currentUser.friends.some((id) => id.toString() === requesterUserId)) {
      currentUser.friends.push(requester._id)
    }

    if (!requester.friends.some((id) => id.toString() === user.id)) {
      requester.friends.push(currentUser._id)
    }

    await Promise.all([currentUser.save(), requester.save()])

    await notificationService.create({
      recipientId: requester.id,
      actorId: currentUser.id,
      type: 'friend_request_accepted',
      title: 'Friend request accepted',
      body: `${currentUser.name} accepted your friend request.`,
      entityId: currentUser.id,
      entityType: 'user',
    })

    return this.getFriendLists(user.id)
  },

  async declineRequest(user: AuthenticatedUser, requesterUserId: string) {
    const [currentUser, requester] = await Promise.all([UserModel.findById(user.id), UserModel.findById(requesterUserId)])
    if (!currentUser || !requester) {
      throw new ApiError(404, 'User not found.')
    }

    currentUser.receivedFriendRequests = currentUser.receivedFriendRequests.filter((id) => id.toString() !== requesterUserId)
    requester.sentFriendRequests = requester.sentFriendRequests.filter((id) => id.toString() !== user.id)
    await Promise.all([currentUser.save(), requester.save()])

    return this.getFriendLists(user.id)
  },

  async cancelRequest(user: AuthenticatedUser, targetUserId: string) {
    const [currentUser, targetUser] = await Promise.all([UserModel.findById(user.id), UserModel.findById(targetUserId)])
    if (!currentUser || !targetUser) {
      throw new ApiError(404, 'User not found.')
    }

    currentUser.sentFriendRequests = currentUser.sentFriendRequests.filter((id) => id.toString() !== targetUserId)
    targetUser.receivedFriendRequests = targetUser.receivedFriendRequests.filter((id) => id.toString() !== user.id)
    await Promise.all([currentUser.save(), targetUser.save()])

    return this.getFriendLists(user.id)
  },

  async removeFriend(user: AuthenticatedUser, targetUserId: string) {
    const [currentUser, targetUser] = await Promise.all([UserModel.findById(user.id), UserModel.findById(targetUserId)])
    if (!currentUser || !targetUser) {
      throw new ApiError(404, 'User not found.')
    }

    currentUser.friends = currentUser.friends.filter((id) => id.toString() !== targetUserId)
    targetUser.friends = targetUser.friends.filter((id) => id.toString() !== user.id)
    await Promise.all([currentUser.save(), targetUser.save()])

    return this.getFriendLists(user.id)
  },
}

function mapUser(user: any): FriendSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
  }
}
