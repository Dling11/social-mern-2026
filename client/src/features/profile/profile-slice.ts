import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { setAuthUser } from '@/features/auth/auth-slice'
import { profileService } from '@/services/profile-service'
import type { Profile } from '@/types/profile'

interface ProfileState {
  current: Profile | null
  status: 'idle' | 'loading' | 'failed'
  uploadStatus: 'idle' | 'loading' | 'failed'
}

const initialState: ProfileState = {
  current: null,
  status: 'idle',
  uploadStatus: 'idle',
}

export const fetchMyProfile = createAsyncThunk('profile/fetchMyProfile', async (_, { rejectWithValue }) => {
  try {
    return await profileService.getMyProfile()
  } catch (error) {
    return rejectWithValue(profileService.getErrorMessage(error))
  }
})

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      const profile = await profileService.uploadAvatar(file)
      dispatch(setAuthUser(profile))
      return profile
    } catch (error) {
      return rejectWithValue(profileService.getErrorMessage(error))
    }
  },
)

export const uploadCover = createAsyncThunk(
  'profile/uploadCover',
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      const profile = await profileService.uploadCover(file)
      dispatch(setAuthUser(profile))
      return profile
    } catch (error) {
      return rejectWithValue(profileService.getErrorMessage(error))
    }
  },
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = 'idle'
        state.current = action.payload
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to load the profile.')
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadStatus = 'loading'
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadStatus = 'idle'
        state.current = action.payload
        toast.success('Profile picture updated.')
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadStatus = 'failed'
        toast.error((action.payload as string) ?? 'Unable to update your profile picture.')
      })
      .addCase(uploadCover.pending, (state) => {
        state.uploadStatus = 'loading'
      })
      .addCase(uploadCover.fulfilled, (state, action) => {
        state.uploadStatus = 'idle'
        state.current = action.payload
        toast.success('Cover photo updated.')
      })
      .addCase(uploadCover.rejected, (state, action) => {
        state.uploadStatus = 'failed'
        toast.error((action.payload as string) ?? 'Unable to update your cover photo.')
      })
  },
})

export default profileSlice.reducer
