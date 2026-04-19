import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth-service'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  status: 'idle' | 'loading' | 'failed'
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  status: 'idle',
}

export const bootstrapSession = createAsyncThunk('auth/bootstrap', async () => {
  return authService.getCurrentUser()
})

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await authService.login(payload)
  } catch (error) {
    return rejectWithValue(authService.getErrorMessage(error))
  }
})

export const register = createAsyncThunk('auth/register', async (payload: RegisterPayload, { rejectWithValue }) => {
  try {
    return await authService.register(payload)
  } catch (error) {
    return rejectWithValue(authService.getErrorMessage(error))
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.isBootstrapping = true
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.isBootstrapping = false
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isBootstrapping = false
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.status = 'idle'
        toast.success(`Welcome back, ${action.payload.name}.`)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to sign in right now.')
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.status = 'idle'
        toast.success(`Account created for ${action.payload.name}.`)
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to create your account right now.')
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.status = 'idle'
        toast.success('Signed out successfully.')
      })
  },
})

export const { setAuthUser } = authSlice.actions
export default authSlice.reducer
