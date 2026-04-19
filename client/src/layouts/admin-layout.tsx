import { BarChart3, Shield, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { logout } from '@/features/auth/auth-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { cn } from '@/utils/cn'

const adminNav = [
  { label: 'Overview', to: '/admin', icon: BarChart3 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Posts', to: '/admin/posts', icon: Shield },
]

export function AdminLayout() {
  const dispatch = useAppDispatch()

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="h-fit space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Control Center</h1>
          </div>

          <nav className="space-y-2">
            {adminNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/admin'}
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

          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => void dispatch(logout())}>
              Logout
            </Button>
          </div>
        </Card>

        <Outlet />
      </div>
    </div>
  )
}
