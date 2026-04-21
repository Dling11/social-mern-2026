import { Bell, Home, MessageCircle, Search, UserCircle2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { MessagePanel } from '@/components/messages/message-panel'
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
import { fetchConversations } from '@/features/message/message-slice'
import { fetchNotifications } from '@/features/notification/notification-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { useMessageSocket } from '@/hooks/use-message-socket'
import { useNotificationSocket } from '@/hooks/use-notification-socket'
import { userService } from '@/services/user-service'
import type { AuthUser } from '@/types/auth'
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
  const messageUnreadCount = useAppSelector((state) =>
    state.message.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
  )
  const unreadCount = useAppSelector((state) => state.notification.items.filter((item) => !item.isRead).length)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AuthUser[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useNotificationSocket()
  useMessageSocket()

  useEffect(() => {
    void dispatch(fetchFriendLists())
    void dispatch(fetchConversations())
    void dispatch(fetchNotifications())
  }, [dispatch])

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    if (trimmedQuery.length < 2) {
      setSearchResults([])
      setIsSearchLoading(false)
      return
    }

    let isActive = true
    setIsSearchLoading(true)

    const timeoutId = window.setTimeout(() => {
      void userService
        .searchUsers(trimmedQuery)
        .then((users) => {
          if (!isActive) {
            return
          }

          setSearchResults(users)
          setIsSearchOpen(true)
        })
        .catch(() => {
          if (!isActive) {
            return
          }

          setSearchResults([])
        })
        .finally(() => {
          if (!isActive) {
            return
          }

          setIsSearchLoading(false)
        })
    }, 220)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [searchQuery])

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      return
    }

    setIsSearchOpen(false)
    navigate(`/discover?q=${encodeURIComponent(trimmedQuery)}`)
  }

  const handleSelectUser = (userId: string) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    navigate(`/profile/${userId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
          <div className="relative mx-auto flex w-full max-w-[1720px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 xl:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Social Platform</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Newsfeed</h1>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <form
                className="hidden min-w-80 items-center gap-3 md:flex"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSearchSubmit()
                }}
              >
                <div className="relative z-50 w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0 || searchQuery.trim().length >= 2) {
                        setIsSearchOpen(true)
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setIsSearchOpen(false), 140)
                    }}
                    className="rounded-full pl-10"
                    placeholder="Search people and profiles"
                  />
                  {isSearchOpen && searchQuery.trim().length >= 2 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-[70] overflow-hidden rounded-[10px] border border-border/80 bg-card shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                      <div className="border-b border-border/70 px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {isSearchLoading ? 'Searching...' : 'People'}
                      </div>
                      <div className="max-h-80 overflow-y-auto py-2">
                        {!isSearchLoading && searchResults.length > 0 ? (
                          searchResults.map((result) => (
                            <button
                              key={result.id}
                              type="button"
                              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-accent"
                              onClick={() => handleSelectUser(result.id)}
                            >
                              <Avatar name={result.name} src={result.avatarUrl} className="h-11 w-11 rounded-[10px]" />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">{result.name}</p>
                                <p className="truncate text-sm text-muted-foreground">
                                  {result.username ? `@${result.username}` : result.email}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : null}
                        {!isSearchLoading && searchResults.length === 0 ? (
                          <div className="px-4 py-4 text-sm text-muted-foreground">No matching users found.</div>
                        ) : null}
                        {!isSearchLoading && searchResults.length > 0 ? (
                          <button
                            type="button"
                            className="w-full cursor-pointer border-t border-border/70 px-4 py-3 text-left text-sm font-medium text-primary transition hover:bg-accent"
                            onClick={handleSearchSubmit}
                          >
                            See all results for "{searchQuery.trim()}"
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <MessageCircle className="h-4 w-4" />
                    {messageUnreadCount > 0 ? (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                        {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                      </span>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[24rem] p-0">
                  <MessagePanel />
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle />
              <Button variant="outline" onClick={() => void dispatch(logout())}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[1720px] gap-5 px-5 py-4 sm:px-6 xl:grid-cols-[300px_minmax(0,1fr)_340px] xl:px-7">
          <Card className="hidden h-fit self-start overflow-hidden p-0 xl:sticky xl:top-[5rem] xl:block">
            <CardHeader className="border-b border-border/70 bg-secondary/65 px-5 py-5">
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
                        'flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'border border-primary/20 bg-primary/12 text-primary shadow-sm'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.label === 'Messages' && messageUnreadCount > 0 ? <Badge className="ml-auto">{messageUnreadCount}</Badge> : null}
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

          <main className="min-w-0 pr-1">
            <Outlet />
          </main>

          <div className="hidden self-start space-y-4 xl:sticky xl:top-[5rem] xl:block">
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
