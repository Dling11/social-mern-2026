import { Eye, EyeOff, KeyRound, MoreHorizontal, Shield, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Avatar } from '@/components/shared/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteAdminUser, fetchAdminUsers, resetAdminUserPassword, updateAdminUserRole } from '@/features/admin/admin-slice'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/auth-schemas'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import type { AdminUserRow } from '@/types/admin'
import { formatRelativeDate } from '@/utils/date'

export function AdminUsersPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.admin.users)
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'delete' | 'password' | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: 'admin-reset-placeholder',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  useEffect(() => {
    void dispatch(fetchAdminUsers())
  }, [dispatch])

  const closeDialog = () => {
    setDialogMode(null)
    if (dialogMode === 'password') {
      reset({
        currentPassword: 'admin-reset-placeholder',
        newPassword: '',
        confirmNewPassword: '',
      })
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }

  const onSubmitPasswordReset = handleSubmit(async (values) => {
    if (!selectedUser) {
      return
    }

    const result = await dispatch(
      resetAdminUserPassword({
        userId: selectedUser.id,
        password: values.newPassword,
      }),
    )

    if (resetAdminUserPassword.fulfilled.match(result)) {
      closeDialog()
      setSelectedUser(null)
    }
  })

  return (
    <>
      <Card className="overflow-hidden p-0">
        <CardHeader className="border-b border-border/70 px-6 py-5">
          <CardTitle>User Management</CardTitle>
          <CardDescription>Review profiles, enforce the single-admin rule, and remove user accounts when needed.</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Friends</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} className="h-10 w-10" />
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.username ? `@${user.username}` : 'No username'}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.friendCount}</TableCell>
                <TableCell className="text-muted-foreground">{formatRelativeDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setDialogMode('view')
                        }}
                      >
                        <UserRound className="h-4 w-4" />
                        View User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          void dispatch(
                            updateAdminUserRole({
                              userId: user.id,
                              role: user.role === 'admin' ? 'user' : 'admin',
                            }),
                          )
                        }
                      >
                        <Shield className="h-4 w-4" />
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setDialogMode('password')
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                        Change Password
                      </DropdownMenuItem>
                      {user.role !== 'admin' ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedUser(user)
                            setDialogMode('delete')
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogMode === 'view' && !!selectedUser} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Quick admin review for the selected account.</DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedUser.name} className="h-12 w-12" />
                <div>
                  <p className="font-semibold text-foreground">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid gap-3 rounded-[10px] bg-secondary/40 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Username</span><span>{selectedUser.username ? `@${selectedUser.username}` : 'No username'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="capitalize">{selectedUser.role}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Friends</span><span>{selectedUser.friendCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{formatRelativeDate(selectedUser.createdAt)}</span></div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'password' && !!selectedUser} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name}. The user can sign in with this new password right away.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void onSubmitPasswordReset(event)}>
            <div className="space-y-2">
              <Label htmlFor="admin-new-password">New password</Label>
              <div className="relative">
                <Input
                  id="admin-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className="pr-11"
                  placeholder="Enter the new password"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowNewPassword((value) => !value)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword ? <p className="text-sm text-destructive">{errors.newPassword.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="admin-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pr-11"
                  placeholder="Confirm the new password"
                  {...register('confirmNewPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmNewPassword ? <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p> : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">Save Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'delete' && !!selectedUser} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will permanently remove {selectedUser?.name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (selectedUser) {
                  await dispatch(deleteAdminUser(selectedUser.id))
                  closeDialog()
                  setSelectedUser(null)
                }
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
