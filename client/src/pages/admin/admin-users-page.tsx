import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchAdminUsers, updateAdminUserRole } from '@/features/admin/admin-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { formatRelativeDate } from '@/utils/date'

export function AdminUsersPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.admin.users)

  useEffect(() => {
    void dispatch(fetchAdminUsers())
  }, [dispatch])

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border px-6 py-4">
        <p className="text-sm font-semibold text-foreground">User Management</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary/60 text-left text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Friends</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-6 py-4 capitalize text-foreground">{user.role}</td>
                <td className="px-6 py-4 text-foreground">{user.friendCount}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatRelativeDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void dispatch(updateAdminUserRole({ userId: user.id, role: user.role === 'admin' ? 'user' : 'admin' }))
                    }
                  >
                    Make {user.role === 'admin' ? 'User' : 'Admin'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
