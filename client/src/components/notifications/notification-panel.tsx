import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { markAllNotificationsRead, markNotificationRead } from '@/features/notification/notification-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { formatRelativeDate } from '@/utils/date'

export function NotificationPanel() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.notification.items)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => void dispatch(markAllNotificationsRead())}>
          Mark all read
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${item.isRead ? 'border-border bg-background' : 'border-primary/20 bg-accent'}`}
            onClick={() => void dispatch(markNotificationRead(item.id))}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <span className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </button>
        ))}
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No notifications yet.</p> : null}
      </div>
    </Card>
  )
}
