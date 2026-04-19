import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
      <CardHeader className="border-b border-border/70 px-6 py-5">
        <CardTitle>User Management</CardTitle>
        <CardDescription>Promote admins, review accounts, and monitor relationship growth.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Friends</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{user.friendCount}</TableCell>
              <TableCell className="text-muted-foreground">{formatRelativeDate(user.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void dispatch(updateAdminUserRole({ userId: user.id, role: user.role === 'admin' ? 'user' : 'admin' }))
                  }
                >
                  Make {user.role === 'admin' ? 'User' : 'Admin'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
