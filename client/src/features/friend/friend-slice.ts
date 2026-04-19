import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { friendService } from '@/services/friend-service'
import type { FriendListResponse } from '@/types/friend'

interface FriendState {
  friends: FriendListResponse['friends']
  receivedRequests: FriendListResponse['receivedRequests']
  sentRequests: FriendListResponse['sentRequests']
  status: 'idle' | 'loading' | 'failed'
  actionStatus: 'idle' | 'loading' | 'failed'
}

const initialState: FriendState = {
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  status: 'idle',
  actionStatus: 'idle',
}

export const fetchFriendLists = createAsyncThunk('friend/fetchLists', async (_, { rejectWithValue }) => {
  try {
    return await friendService.getLists()
  } catch (error) {
    return rejectWithValue(friendService.getErrorMessage(error))
  }
})

function createFriendActionThunk(type: string, action: (userId: string) => Promise<FriendListResponse>) {
  return createAsyncThunk(type, async (userId: string, { rejectWithValue }) => {
    try {
      return await action(userId)
    } catch (error) {
      return rejectWithValue(friendService.getErrorMessage(error))
    }
  })
}

export const sendFriendRequest = createFriendActionThunk('friend/sendRequest', friendService.sendRequest)
export const acceptFriendRequest = createFriendActionThunk('friend/acceptRequest', friendService.acceptRequest)
export const declineFriendRequest = createFriendActionThunk('friend/declineRequest', friendService.declineRequest)
export const cancelFriendRequest = createFriendActionThunk('friend/cancelRequest', friendService.cancelRequest)
export const removeFriend = createFriendActionThunk('friend/removeFriend', friendService.removeFriend)

const friendPendingTypes = [
  sendFriendRequest.pending.type,
  acceptFriendRequest.pending.type,
  declineFriendRequest.pending.type,
  cancelFriendRequest.pending.type,
  removeFriend.pending.type,
]

const friendFulfilledTypes = [
  sendFriendRequest.fulfilled.type,
  acceptFriendRequest.fulfilled.type,
  declineFriendRequest.fulfilled.type,
  cancelFriendRequest.fulfilled.type,
  removeFriend.fulfilled.type,
]

const friendRejectedTypes = [
  sendFriendRequest.rejected.type,
  acceptFriendRequest.rejected.type,
  declineFriendRequest.rejected.type,
  cancelFriendRequest.rejected.type,
  removeFriend.rejected.type,
]

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const applyLists = (state: FriendState, action: { payload: FriendListResponse }) => {
      state.friends = action.payload.friends
      state.receivedRequests = action.payload.receivedRequests
      state.sentRequests = action.payload.sentRequests
      state.status = 'idle'
      state.actionStatus = 'idle'
    }

    builder
      .addCase(fetchFriendLists.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchFriendLists.fulfilled, applyLists)
      .addCase(fetchFriendLists.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to load friend data.')
      })
      .addMatcher(
        (action): action is { type: string } => friendPendingTypes.includes(action.type),
        (state) => {
          state.actionStatus = 'loading'
        },
      )
      .addMatcher(
        (action): action is { type: string; payload: FriendListResponse } => friendFulfilledTypes.includes(action.type),
        (state, action) => {
          applyLists(state, action)
        },
      )
      .addMatcher(
        (action): action is { type: string; payload?: string } => friendRejectedTypes.includes(action.type),
        (state, action) => {
          state.actionStatus = 'failed'
          toast.error(action.payload ?? 'Unable to update friendship right now.')
        },
      )
  },
})

export default friendSlice.reducer
