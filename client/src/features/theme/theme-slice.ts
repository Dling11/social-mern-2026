import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getStoredTheme, persistTheme, type ThemeMode } from '@/features/theme/theme-storage'
import { applyTheme } from '@/features/theme/theme-utils'

interface ThemeState {
  mode: ThemeMode
}

const initialState: ThemeState = {
  mode: getStoredTheme(),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      persistTheme(action.payload)
      applyTheme(action.payload)
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
