import type { ThemeMode } from '@/features/theme/theme-storage'

export function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
