import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin-service'
import type { AdminPostRow, AdminStats, AdminUserRow } from '@/types/admin'

interface AdminState {
  stats: AdminStats | null
  users: AdminUserRow[]
  posts: AdminPostRow[]
  status: 'idle' | 'loading' | 'failed'
}

const initialState: AdminState = {
  stats: null,
  users: [],
  posts: [],
  status: 'idle',
}

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getStats()
  } catch (error) {
    return rejectWithValue(adminService.getErrorMessage(error))
  }
})

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getUsers()
  } catch (error) {
    return rejectWithValue(adminService.getErrorMessage(error))
  }
})

export const fetchAdminPosts = createAsyncThunk('admin/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getPosts()
  } catch (error) {
    return rejectWithValue(adminService.getErrorMessage(error))
  }
})

export const updateAdminUserRole = createAsyncThunk(
  'admin/updateRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }, { rejectWithValue }) => {
    try {
      return await adminService.updateUserRole(userId, role)
    } catch (error) {
      return rejectWithValue(adminService.getErrorMessage(error))
    }
  },
)

export const deleteAdminPost = createAsyncThunk('admin/deletePost', async (postId: string, { rejectWithValue }) => {
  try {
    await adminService.deletePost(postId)
    return postId
  } catch (error) {
    return rejectWithValue(adminService.getErrorMessage(error))
  }
})

export const deleteAdminUser = createAsyncThunk('admin/deleteUser', async (userId: string, { rejectWithValue }) => {
  try {
    await adminService.deleteUser(userId)
    return userId
  } catch (error) {
    return rejectWithValue(adminService.getErrorMessage(error))
  }
})

export const resetAdminUserPassword = createAsyncThunk(
  'admin/resetUserPassword',
  async (payload: { userId: string; password: string }, { rejectWithValue }) => {
    try {
      await adminService.resetUserPassword(payload)
      return payload.userId
    } catch (error) {
      return rejectWithValue(adminService.getErrorMessage(error))
    }
  },
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload
      })
      .addCase(fetchAdminPosts.fulfilled, (state, action) => {
        state.posts = action.payload
      })
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        state.users = state.users.map((user) => (user.id === action.payload.id ? action.payload : user))
        toast.success('User role updated.')
      })
      .addCase(updateAdminUserRole.rejected, (_state, action) => {
        toast.error((action.payload as string) ?? 'Unable to update the role.')
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload)
        toast.success('User deleted.')
      })
      .addCase(deleteAdminUser.rejected, (_state, action) => {
        toast.error((action.payload as string) ?? 'Unable to delete user.')
      })
      .addCase(deleteAdminPost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload)
        toast.success('Post deleted.')
      })
      .addCase(deleteAdminPost.rejected, (_state, action) => {
        toast.error((action.payload as string) ?? 'Unable to delete post.')
      })
      .addCase(resetAdminUserPassword.fulfilled, () => {
        toast.success('Password updated for this user.')
      })
      .addCase(resetAdminUserPassword.rejected, (_state, action) => {
        toast.error((action.payload as string) ?? 'Unable to reset the password.')
      })
  },
})

export default adminSlice.reducer
