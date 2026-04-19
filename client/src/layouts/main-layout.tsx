import { Bell, Home, MessageCircle, Search, UserCircle2, Users } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { NotificationPanel } from '@/components/notifications/notification-panel'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { logout } from '@/features/auth/auth-slice'
import { fetchFriendLists } from '@/features/friend/friend-slice'
import { fetchNotifications, receiveNotification } from '@/features/notification/notification-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { getSocket } from '@/services/socket-service'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Feed', icon: Home, to: '/feed' },
  { label: 'Profile', icon: UserCircle2, to: '/profile' },
  { label: 'Friends', icon: Users, to: '/feed' },
  { label: 'Messages', icon: MessageCircle, to: '/messages' },
  { label: 'Notifications', icon: Bell, to: '/feed' },
]

export function MainLayout() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { friends, receivedRequests } = useAppSelector((state) => state.friend)
  const unreadCount = useAppSelector((state) => state.notification.items.filter((item) => !item.isRead).length)

  useEffect(() => {
    void dispatch(fetchFriendLists())
    void dispatch(fetchNotifications())
  }, [dispatch])

  useEffect(() => {
    const socket = getSocket()
    const handleNotification = (notification: any) => {
      dispatch(receiveNotification(notification))
    }

    socket.on('notification:new', handleNotification)
    return () => {
      socket.off('notification:new', handleNotification)
    }
  }, [dispatch])

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
            <div className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
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
              <p className="text-sm font-semibold text-foreground">Connections</p>
              <div className="mt-4 space-y-4">
                {friends.slice(0, 3).map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.email}</p>
                    </div>
                    <Button size="sm" variant="secondary">Friend</Button>
                  </div>
                ))}
                {friends.length === 0 ? <p className="text-sm text-muted-foreground">No friends connected yet.</p> : null}
              </div>
            </Card>

            <Card>
              <p className="text-sm font-semibold text-foreground">Requests</p>
              <div className="mt-4 space-y-3">
                {receivedRequests.slice(0, 4).map((request) => (
                  <div key={request.id}>
                    <p className="font-medium text-foreground">{request.name}</p>
                    <p className="text-sm text-muted-foreground">Sent you a friend request</p>
                  </div>
                ))}
                {receivedRequests.length === 0 ? (
                  <p className="text-sm leading-7 text-muted-foreground">No incoming requests right now.</p>
                ) : null}
              </div>
            </Card>

            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
