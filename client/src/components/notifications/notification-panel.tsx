import { BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { markAllNotificationsRead, markNotificationRead } from '@/features/notification/notification-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { formatRelativeDate } from '@/utils/date'

export function NotificationPanel() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.notification.items)

  return (
    <Card className="p-0">
      <CardHeader className="flex-row items-center justify-between border-b border-border/70 px-5 py-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellRing className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Realtime activity across your social space.</CardDescription>
        </div>
        <Button size="sm" variant="ghost" onClick={() => void dispatch(markAllNotificationsRead())}>
          Mark all read
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-[28rem]">
          <div className="space-y-2 p-4">
            {items.slice(0, 10).map((item) => (
              <button
                key={item.id}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  item.isRead
                    ? 'border-border/70 bg-background/70 hover:bg-accent/40'
                    : 'border-primary/20 bg-primary/5 hover:bg-primary/8'
                }`}
                onClick={() => void dispatch(markNotificationRead(item.id))}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </button>
            ))}
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
