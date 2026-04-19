import { Bell, Home, MessageCircle, Search, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { logout } from '@/features/auth/auth-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Feed', icon: Home, to: '/feed' },
  { label: 'Friends', icon: Users, to: '/feed' },
  { label: 'Messages', icon: MessageCircle, to: '/feed' },
  { label: 'Notifications', icon: Bell, to: '/feed' },
]

export function MainLayout() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border bg-card/95 px-5 py-4 shadow-[var(--shadow-soft)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Social Platform</p>
            <h1 className="text-2xl font-semibold text-foreground">Newsfeed</h1>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden min-w-72 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 md:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Search people, posts, and communities</span>
            </div>
            <ThemeToggle />
            <Button variant="outline" onClick={() => void dispatch(logout())}>
              Logout
            </Button>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <Card className="h-fit space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </Card>

          <main>
            <Outlet />
          </main>

          <div className="space-y-4">
            <Card>
              <p className="text-sm font-semibold text-foreground">Suggestions</p>
              <div className="mt-4 space-y-4">
                {['Mia Jordan', 'Elijah Reed', 'Sophia Tran'].map((name) => (
                  <div key={name} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">Suggested for you</p>
                    </div>
                    <Button size="sm" variant="secondary">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-sm font-semibold text-foreground">Coming Next</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                This layout is ready for stories, trends, notifications, chat launchers, and profile shortcuts in the
                next phases.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
