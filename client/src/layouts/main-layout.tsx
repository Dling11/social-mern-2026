import { Bell, Home, MessageCircle, Search, UserCircle2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { NotificationPanel } from '@/components/notifications/notification-panel'
import { Avatar } from '@/components/shared/avatar'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  { label: 'Friends', icon: Users, to: '/friends' },
  { label: 'Messages', icon: MessageCircle, to: '/messages' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
]

export function MainLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { friends, receivedRequests } = useAppSelector((state) => state.friend)
  const unreadCount = useAppSelector((state) => state.notification.items.filter((item) => !item.isRead).length)
  const [searchQuery, setSearchQuery] = useState('')

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
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-border/70 bg-card/90 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Social Platform</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Newsfeed</h1>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <form
              className="hidden min-w-80 items-center gap-3 md:flex"
              onSubmit={(event) => {
                event.preventDefault()
                if (searchQuery.trim()) {
                  navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
            >
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="rounded-full pl-10"
                  placeholder="Search people and profiles"
                />
              </div>
            </form>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[24rem] p-0">
                <NotificationPanel />
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
            <Button variant="outline" onClick={() => void dispatch(logout())}>
              Logout
            </Button>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
          <Card className="h-fit p-0">
            <CardHeader className="rounded-t-[1.8rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_44%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(16,185,129,0.04))] px-5 py-5">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name ?? 'You'} src={user?.avatarUrl} className="h-14 w-14 ring-4 ring-background" />
                <div>
                  <CardDescription>Profile</CardDescription>
                  <CardTitle className="text-xl">{user?.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-4 py-4">
              <nav className="space-y-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(37,99,235,0.24)]'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.label === 'Notifications' && unreadCount > 0 ? <Badge className="ml-auto">{unreadCount}</Badge> : null}
                  </NavLink>
                ))}
              </nav>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Connections</p>
                  <Badge variant="secondary">{friends.length}</Badge>
                </div>
                {friends.slice(0, 3).map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/40 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={friend.name} src={friend.avatarUrl} className="h-11 w-11" />
                      <div>
                        <p className="font-medium text-foreground">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${friend.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
                {friends.length === 0 ? <p className="text-sm text-muted-foreground">No friends connected yet.</p> : null}
              </div>
            </CardContent>
          </Card>

          <main>
            <Outlet />
          </main>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Requests</CardTitle>
                  <Badge variant="secondary">{receivedRequests.length}</Badge>
                </div>
                <CardDescription>People waiting to connect with you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {receivedRequests.slice(0, 4).map((request) => (
                  <button
                    key={request.id}
                    className="flex w-full items-center gap-3 rounded-2xl bg-secondary/40 p-3 text-left transition hover:bg-secondary/70"
                    onClick={() => navigate(`/profile/${request.id}`)}
                  >
                    <Avatar name={request.name} src={request.avatarUrl} className="h-11 w-11" />
                    <div>
                      <p className="font-medium text-foreground">{request.name}</p>
                      <p className="text-sm text-muted-foreground">Sent you a friend request</p>
                    </div>
                  </button>
                ))}
                {receivedRequests.length === 0 ? (
                  <p className="text-sm leading-7 text-muted-foreground">No incoming requests right now.</p>
                ) : null}
              </CardContent>
            </Card>

            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
