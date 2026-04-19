import { useEffect } from 'react'
import { NotificationPanel } from '@/components/notifications/notification-panel'
import { Card } from '@/components/ui/card'
import { fetchNotifications } from '@/features/notification/notification-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'

export function NotificationsPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-lg font-semibold text-foreground">Notifications</p>
        <p className="mt-2 text-sm text-muted-foreground">Keep up with friend activity, posts, comments, and messages.</p>
      </Card>
      <NotificationPanel />
    </div>
  )
}
