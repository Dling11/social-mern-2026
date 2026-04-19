import { Moon, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setTheme } from '@/features/theme/theme-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.mode)

  return (
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full"
      onClick={() => dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
    </Button>
  )
}
