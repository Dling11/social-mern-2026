import { zodResolver } from '@hookform/resolvers/zod'
import {
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  MessageCircle,
  PencilLine,
  UserPlus,
  UserRoundMinus,
  UserRoundPlus,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '@/components/feed/post-card'
import { FeedSkeleton } from '@/components/feed/feed-skeleton'
import { Avatar } from '@/components/shared/avatar'
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
import { Textarea } from '@/components/ui/textarea'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/auth-schemas'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  fetchFriendLists,
  removeFriend,
  sendFriendRequest,
} from '@/features/friend/friend-slice'
import { updateBioSchema, type UpdateBioValues } from '@/features/profile/profile-schemas'
import { fetchMyProfile, updateMyProfile, uploadAvatar, uploadCover } from '@/features/profile/profile-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { authService } from '@/services/auth-service'
import { feedService } from '@/services/feed-service'
import { profileService } from '@/services/profile-service'
import type { FeedPost } from '@/types/post'
import type { Profile } from '@/types/profile'

function DefaultCoverArtwork({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="absolute inset-0 overflow-hidden bg-secondary">
      <div className="absolute left-6 top-6 h-24 w-24 rounded-[22px] border border-primary/18 bg-background/50" />
      <div className="absolute bottom-6 left-20 h-12 w-40 rounded-[14px] border border-border/80 bg-background/55" />
      <div className="absolute right-8 top-8 h-16 w-28 rounded-[16px] border border-border/80 bg-background/55" />
      <div className="absolute bottom-8 right-8 h-28 w-28 rounded-full border border-primary/16 bg-background/45" />
      <div className="absolute inset-x-0 bottom-0 h-20 border-t border-border/70 bg-background/25" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid h-20 w-20 place-items-center rounded-[18px] border border-primary/20 bg-background/80 text-2xl font-semibold text-primary shadow-sm">
          {initials}
        </div>
      </div>
    </div>
  )
}

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
  const [isEditingBio, setIsEditingBio] = useState(false)
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

  const {
    register: registerBio,
    handleSubmit: handleBioSubmit,
    reset: resetBioForm,
    formState: { errors: bioErrors },
  } = useForm<UpdateBioValues>({
    resolver: zodResolver(updateBioSchema),
    defaultValues: {
      bio: '',
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
          resetBioForm({ bio: result.payload.bio ?? '' })
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
  }, [activeUserId, actionStatus, dispatch, isOwnProfile, resetBioForm])

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
      resetBioForm({ bio: current.bio ?? '' })
    }
  }, [current, isOwnProfile, resetBioForm])

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

  const onSubmitBio = handleBioSubmit(async (values) => {
    const result = await dispatch(updateMyProfile({ bio: values.bio?.trim() || null }))
    if (updateMyProfile.fulfilled.match(result)) {
      setProfile(result.payload)
      resetBioForm({ bio: result.payload.bio ?? '' })
      setIsEditingBio(false)
    }
  })

  return (
    <>
      <PhotoProvider maskOpacity={0.72}>
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="relative h-60 border-b border-border/70 sm:h-72">
              {profile.coverUrl ? (
                <PhotoView src={profile.coverUrl}>
                  <button type="button" className="block h-full w-full cursor-zoom-in">
                    <img src={profile.coverUrl} alt="Profile cover" className="h-full w-full object-cover" />
                  </button>
                </PhotoView>
              ) : (
                <DefaultCoverArtwork name={profile.name} />
              )}

              {isOwnProfile ? (
                <label className="absolute right-5 top-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/92 px-4 py-2 text-sm font-medium text-card-foreground shadow-sm">
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

            <div className="relative z-10 px-6 pb-6">
              <div className="-mt-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-end gap-4">
                  <div className="relative h-28 w-28 overflow-hidden rounded-[22px] border-4 border-card bg-secondary shadow-sm">
                    {profile.avatarUrl ? (
                      <PhotoView src={profile.avatarUrl}>
                        <button type="button" className="block h-full w-full cursor-zoom-in">
                          <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                        </button>
                      </PhotoView>
                    ) : (
                      <Avatar name={profile.name} className="h-full w-full rounded-[18px] text-3xl" />
                    )}
                    {isOwnProfile ? (
                      <label className="absolute bottom-2 right-2 inline-flex cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card p-2 text-card-foreground shadow-sm">
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
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {profile.username ? <span>@{profile.username}</span> : null}
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[380px]">
                  <div className="rounded-[12px] border border-border/70 bg-secondary/55 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Posts</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{profile.postCount}</p>
                  </div>
                  <div className="rounded-[12px] border border-border/70 bg-secondary/55 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Friends</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{profile.friendCount}</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 rounded-[12px] border border-border/70 bg-background/95 p-4 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditingBio((value) => !value)} disabled={uploadStatus === 'loading'}>
                        {isEditingBio ? <X className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
                        {isEditingBio ? 'Cancel edit' : 'Edit bio'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)} disabled={uploadStatus === 'loading'}>
                        <KeyRound className="h-4 w-4" />
                        Change password
                      </Button>
                      <Button variant="secondary" disabled={uploadStatus === 'loading'}>
                        {uploadStatus === 'loading' ? 'Updating...' : 'Profile ready'}
                      </Button>
                    </>
                  ) : profile.friendshipStatus === 'none' ? (
                    <Button onClick={() => void dispatch(sendFriendRequest(profile.id))} disabled={actionStatus === 'loading'}>
                      <UserRoundPlus className="h-4 w-4" />
                      Add friend
                    </Button>
                  ) : profile.friendshipStatus === 'outgoing_request' ? (
                    <Button
                      variant="outline"
                      onClick={() => void dispatch(cancelFriendRequest(profile.id))}
                      disabled={actionStatus === 'loading'}
                    >
                      <UserPlus className="h-4 w-4" />
                      Cancel request
                    </Button>
                  ) : profile.friendshipStatus === 'incoming_request' ? (
                    <>
                      <Button onClick={() => void dispatch(acceptFriendRequest(profile.id))} disabled={actionStatus === 'loading'}>
                        <UserPlus className="h-4 w-4" />
                        Accept request
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
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => void dispatch(removeFriend(profile.id))}
                        disabled={actionStatus === 'loading'}
                      >
                        <UserRoundMinus className="h-4 w-4" />
                        Remove friend
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">About</p>
                <p className="mt-1 text-sm text-muted-foreground">A simple profile intro, similar to a lightweight Facebook bio.</p>
              </div>
              {!isOwnProfile && profile.avatarUrl ? (
                <PhotoView src={profile.avatarUrl}>
                  <Button variant="outline" size="sm">
                    <ImagePlus className="h-4 w-4" />
                    View image
                  </Button>
                </PhotoView>
              ) : null}
            </div>

            <div className="mt-4">
              {isOwnProfile && isEditingBio ? (
                <form className="space-y-3" onSubmit={(event) => void onSubmitBio(event)}>
                  <Textarea
                    placeholder="Write a short intro about yourself..."
                    className="min-h-[116px]"
                    {...registerBio('bio')}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">Keep it short, warm, and personal. Maximum 180 characters.</p>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => {
                        resetBioForm({ bio: profile.bio ?? '' })
                        setIsEditingBio(false)
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploadStatus === 'loading'}>
                        Save bio
                      </Button>
                    </div>
                  </div>
                  {bioErrors.bio ? <p className="text-sm text-destructive">{bioErrors.bio.message}</p> : null}
                </form>
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  {profile.bio || (isOwnProfile ? 'Add a short bio so people can learn a little about you.' : 'No bio added yet.')}
                </p>
              )}
            </div>
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
      </PhotoProvider>

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
