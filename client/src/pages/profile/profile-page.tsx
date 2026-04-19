import { Eye, EyeOff, KeyRound, Camera, ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '@/components/feed/post-card'
import { FeedSkeleton } from '@/components/feed/feed-skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  fetchFriendLists,
  removeFriend,
  sendFriendRequest,
} from '@/features/friend/friend-slice'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/auth-schemas'
import { fetchMyProfile, uploadAvatar, uploadCover } from '@/features/profile/profile-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { authService } from '@/services/auth-service'
import { feedService } from '@/services/feed-service'
import { profileService } from '@/services/profile-service'
import type { FeedPost } from '@/types/post'
import type { Profile } from '@/types/profile'

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { userId } = useParams()
  const authUser = useAppSelector((state) => state.auth.user)
  const { actionStatus } = useAppSelector((state) => state.friend)
  const { current, status, uploadStatus } = useAppSelector((state) => state.profile)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const activeUserId = userId ?? authUser?.id ?? ''
  const isOwnProfile = !userId || userId === authUser?.id

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  useEffect(() => {
    void dispatch(fetchFriendLists())
  }, [dispatch])

  useEffect(() => {
    const loadProfile = async () => {
      if (!activeUserId) {
        return
      }

      if (isOwnProfile) {
        const result = await dispatch(fetchMyProfile())
        if (fetchMyProfile.fulfilled.match(result)) {
          setProfile(result.payload)
        }
        return
      }

      try {
        const externalProfile = await profileService.getProfile(activeUserId)
        setProfile(externalProfile)
      } catch {
        setProfile(null)
      }
    }

    void loadProfile()
  }, [activeUserId, actionStatus, dispatch, isOwnProfile])

  useEffect(() => {
    const loadPosts = async () => {
      if (!activeUserId) {
        return
      }

      setIsLoadingPosts(true)
      const result = await feedService.getPostsByUser(activeUserId)
      setPosts(result)
      setIsLoadingPosts(false)
    }

    void loadPosts()
  }, [activeUserId, current?.avatarUrl, current?.coverUrl])

  useEffect(() => {
    if (isOwnProfile && current) {
      setProfile(current)
    }
  }, [current, isOwnProfile])

  if ((status === 'loading' && isOwnProfile) || !profile) {
    return <FeedSkeleton />
  }

  const onSubmitPasswordChange = handlePasswordSubmit(async (values) => {
    setIsUpdatingPassword(true)

    try {
      const message = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success(message)
      resetPasswordForm()
      setIsPasswordDialogOpen(false)
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (error) {
      toast.error(authService.getErrorMessage(error))
    } finally {
      setIsUpdatingPassword(false)
    }
  })

  return (
    <>
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="relative h-56 bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 sm:h-72">
          {profile.coverUrl ? (
            <img src={profile.coverUrl} alt="Profile cover" className="h-full w-full object-cover" />
          ) : null}
          {isOwnProfile ? (
            <label className="absolute right-5 top-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-sm font-medium text-card-foreground shadow-[var(--shadow-soft)]">
              <ImagePlus className="h-4 w-4" />
              Update cover
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void dispatch(uploadCover(file))
                  }
                }}
              />
            </label>
          ) : null}
        </div>

        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative h-28 w-28 overflow-hidden rounded-[28px] border-4 border-card bg-secondary shadow-[var(--shadow-soft)]">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-3xl font-semibold text-primary">
                    {profile.name.charAt(0)}
                  </div>
                )}
                {isOwnProfile ? (
                  <label className="absolute bottom-2 right-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-card p-2 text-card-foreground shadow-[var(--shadow-soft)]">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          void dispatch(uploadAvatar(file))
                        }
                      }}
                    />
                  </label>
                ) : null}
              </div>

              <div className="pb-2">
                <h2 className="text-3xl font-semibold text-foreground">{profile.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Posts</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{profile.postCount}</p>
              </div>
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Friends</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{profile.friendCount}</p>
              </div>
              {isOwnProfile ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    disabled={uploadStatus === 'loading'}
                  >
                    <KeyRound className="h-4 w-4" />
                    Change password
                  </Button>
                  <Button variant="secondary" disabled={uploadStatus === 'loading'}>
                    {uploadStatus === 'loading' ? 'Updating images...' : 'Profile ready'}
                  </Button>
                </div>
              ) : profile.friendshipStatus === 'none' ? (
                <Button onClick={() => void dispatch(sendFriendRequest(profile.id))} disabled={actionStatus === 'loading'}>
                  Add friend
                </Button>
              ) : profile.friendshipStatus === 'outgoing_request' ? (
                <Button
                  variant="outline"
                  onClick={() => void dispatch(cancelFriendRequest(profile.id))}
                  disabled={actionStatus === 'loading'}
                >
                  Cancel request
                </Button>
              ) : profile.friendshipStatus === 'incoming_request' ? (
                <>
                  <Button onClick={() => void dispatch(acceptFriendRequest(profile.id))} disabled={actionStatus === 'loading'}>
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void dispatch(declineFriendRequest(profile.id))}
                    disabled={actionStatus === 'loading'}
                  >
                    Decline
                  </Button>
                </>
              ) : profile.friendshipStatus === 'friends' ? (
                <>
                  <Button variant="secondary" onClick={() => navigate(`/messages?user=${profile.id}`)}>
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void dispatch(removeFriend(profile.id))}
                    disabled={actionStatus === 'loading'}
                  >
                    Remove friend
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-foreground">About</p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Phase 3 profile foundation is live. This page now supports Cloudinary-backed profile and cover images with a
          folder strategy built for future cleanup and moderation workflows.
        </p>
      </Card>

      {isLoadingPosts ? (
        <FeedSkeleton />
      ) : posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <Card>
          <p className="text-lg font-semibold text-foreground">No posts yet</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {isOwnProfile ? 'Share your first update from the feed composer.' : 'This profile has not posted anything yet.'}
          </p>
        </Card>
      )}
    </div>
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open)
          if (!open) {
            resetPasswordForm()
            setShowCurrentPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password with a fresh one you have not used before.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(event) => void onSubmitPasswordChange(event)}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="pr-11"
                  placeholder="Enter your current password"
                  {...registerPassword('currentPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword ? (
                <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  className="pr-11"
                  placeholder="Choose a stronger password"
                  {...registerPassword('newPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowNewPassword((value) => !value)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword ? <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pr-11"
                  placeholder="Re-enter your new password"
                  {...registerPassword('confirmNewPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmNewPassword ? (
                <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isUpdatingPassword}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Save password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
