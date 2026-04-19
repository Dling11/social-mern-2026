import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { notificationService } from '@/services/notification-service'
import type { AppNotification } from '@/types/notification'

interface NotificationState {
  items: AppNotification[]
  status: 'idle' | 'loading' | 'failed'
}

const initialState: NotificationState = {
  items: [],
  status: 'idle',
}

export const fetchNotifications = createAsyncThunk('notification/fetch', async (_, { rejectWithValue }) => {
  try {
    return await notificationService.getNotifications()
  } catch (error) {
    return rejectWithValue(notificationService.getErrorMessage(error))
  }
})

export const markNotificationRead = createAsyncThunk(
  'notification/markRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.markRead(notificationId)
      return notificationId
    } catch (error) {
      return rejectWithValue(notificationService.getErrorMessage(error))
    }
  },
)

export const markAllNotificationsRead = createAsyncThunk(
  'notification/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead()
      return true
    } catch (error) {
      return rejectWithValue(notificationService.getErrorMessage(error))
    }
  },
)

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    receiveNotification(state, action) {
      state.items.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to load notifications.')
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload ? { ...item, isRead: true } : item))
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }))
      })
  },
})

export const { receiveNotification } = notificationSlice.actions
export default notificationSlice.reducer
