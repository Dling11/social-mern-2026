import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(41,98,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(18,183,106,0.16),_transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden max-w-xl lg:block">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">Phase 1 Foundation</p>
            <h2 className="text-5xl font-semibold leading-tight text-foreground">
              Build a social experience that feels polished from the first screen.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Authentication comes first, but the structure is already prepared for feed, profiles, chat,
              notifications, and admin workflows.
            </p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
