import { configureStore } from '@reduxjs/toolkit'
import adminReducer from '@/features/admin/admin-slice'
import authReducer from '@/features/auth/auth-slice'
import feedReducer from '@/features/feed/feed-slice'
import friendReducer from '@/features/friend/friend-slice'
import messageReducer from '@/features/message/message-slice'
import notificationReducer from '@/features/notification/notification-slice'
import profileReducer from '@/features/profile/profile-slice'
import themeReducer from '@/features/theme/theme-slice'

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    feed: feedReducer,
    friend: friendReducer,
    message: messageReducer,
    notification: notificationReducer,
    profile: profileReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
