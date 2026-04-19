import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { fetchAdminStats } from '@/features/admin/admin-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'

export function AdminOverviewPage() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector((state) => state.admin.stats)

  useEffect(() => {
    void dispatch(fetchAdminStats())
  }, [dispatch])

  const cards = [
    { label: 'Users', value: stats?.totalUsers ?? 0 },
    { label: 'Posts', value: stats?.totalPosts ?? 0 },
    { label: 'Conversations', value: stats?.totalConversations ?? 0 },
    { label: 'Notifications', value: stats?.totalNotifications ?? 0 },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold text-foreground">Overview</p>
        <p className="mt-2 text-sm text-muted-foreground">Live operational snapshot for the platform.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
