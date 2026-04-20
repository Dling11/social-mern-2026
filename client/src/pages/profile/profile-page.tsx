import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  MessageCircle,
  PencilLine,
  Upload,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { updateAvatarSchema, type UpdateAvatarValues } from '@/features/profile/avatar-schemas'
import { updateBioSchema, type UpdateBioValues } from '@/features/profile/profile-schemas'
import { fetchMyProfile, updateAvatarDetails, updateMyProfile, uploadCover } from '@/features/profile/profile-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { useFeedSocket } from '@/hooks/use-feed-socket'
import { authService } from '@/services/auth-service'
import { feedService } from '@/services/feed-service'
import { profileService } from '@/services/profile-service'
import type { FeedPost } from '@/types/post'
import type { Profile } from '@/types/profile'
import { formatRelativeDate } from '@/utils/date'

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

function formatProfileDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
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
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false)
  const [isAvatarEditOpen, setIsAvatarEditOpen] = useState(false)
  const [avatarDraftFile, setAvatarDraftFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const activeUserId = userId ?? authUser?.id ?? ''
  const isOwnProfile = !userId || userId === authUser?.id

  useFeedSocket({
    onNewPost: (post) => {
      if (post.author.id !== activeUserId) {
        return
      }

      const alreadyExists = posts.some((entry) => entry.id === post.id)

      setPosts((currentPosts) => {
        const nextPosts = alreadyExists ? currentPosts.filter((entry) => entry.id !== post.id) : currentPosts
        return [post, ...nextPosts]
      })

      setProfile((currentProfile) =>
        currentProfile && currentProfile.id === activeUserId && !alreadyExists
          ? {
              ...currentProfile,
              postCount: currentProfile.postCount + 1,
            }
          : currentProfile,
      )
    },
    onUpdatedPost: (post) => {
      if (post.author.id !== activeUserId) {
        return
      }

      setPosts((currentPosts) => currentPosts.map((entry) => (entry.id === post.id ? post : entry)))
    },
  })

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

  const {
    register: registerAvatar,
    handleSubmit: handleAvatarSubmit,
    reset: resetAvatarForm,
    formState: { errors: avatarErrors },
  } = useForm<UpdateAvatarValues>({
    resolver: zodResolver(updateAvatarSchema),
    defaultValues: {
      caption: '',
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
      resetAvatarForm({ caption: current.avatarCaption ?? '' })
    }
  }, [current, isOwnProfile, resetAvatarForm, resetBioForm])

  useEffect(() => {
    if (!avatarDraftFile) {
      setAvatarPreviewUrl(null)
      return
    }

    const nextUrl = URL.createObjectURL(avatarDraftFile)
    setAvatarPreviewUrl(nextUrl)

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [avatarDraftFile])

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

  const onSubmitAvatar = handleAvatarSubmit(async (values) => {
    const result = await dispatch(
      updateAvatarDetails({
        file: avatarDraftFile,
        caption: values.caption?.trim() || null,
      }),
    )

    if (updateAvatarDetails.fulfilled.match(result)) {
      setProfile(result.payload)
      setAvatarDraftFile(null)
      setIsAvatarEditOpen(false)
      resetAvatarForm({ caption: result.payload.avatarCaption ?? '' })
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

            <div className="relative z-10 px-6 pb-6 pt-4">
              <div className="-mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-end gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="group relative h-28 w-28 overflow-hidden rounded-[22px] border-4 border-card bg-secondary shadow-sm"
                      >
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                        ) : (
                          <Avatar name={profile.name} className="h-full w-full rounded-[18px] text-3xl" />
                        )}
                        <div className="absolute inset-0 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/28 group-hover:opacity-100" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={10} className="w-56">
                      <DropdownMenuItem
                        onClick={() => {
                          setIsAvatarViewerOpen(true)
                        }}
                      >
                        View profile picture
                      </DropdownMenuItem>
                      {isOwnProfile ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setAvatarDraftFile(null)
                            resetAvatarForm({ caption: profile.avatarCaption ?? '' })
                            setIsAvatarEditOpen(true)
                          }}
                        >
                          {profile.avatarUrl ? 'Edit profile picture' : 'Upload profile picture'}
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="pt-8 sm:pt-10 lg:pb-2">
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
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAvatarDraftFile(null)
                          resetAvatarForm({ caption: profile.avatarCaption ?? '' })
                          setIsAvatarEditOpen(true)
                        }}
                        disabled={uploadStatus === 'loading'}
                      >
                        <Upload className="h-4 w-4" />
                        Update photo
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
                <p className="text-sm font-semibold text-foreground">A simple profile intro</p>
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

      <Dialog open={isAvatarViewerOpen} onOpenChange={setIsAvatarViewerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-8">
              <Avatar name={profile.name} src={profile.avatarUrl} className="h-11 w-11 rounded-[10px]" />
              <div>
                <DialogTitle>{profile.name}</DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatProfileDateTime(profile.createdAt)} · {formatRelativeDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[14px] border border-border/70 bg-secondary/45">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="h-auto max-h-[420px] w-full object-cover" />
              ) : (
                <div className="grid h-[320px] place-items-center">
                  <Avatar name={profile.name} className="h-28 w-28 rounded-[22px] text-4xl" />
                </div>
              )}
            </div>

            {profile.avatarCaption ? (
              <div className="rounded-[12px] border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm leading-7 text-muted-foreground">{profile.avatarCaption}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAvatarViewerOpen(false)}>
              Close
            </Button>
            {isOwnProfile ? (
              <Button
                type="button"
                onClick={() => {
                  setIsAvatarViewerOpen(false)
                  setAvatarDraftFile(null)
                  resetAvatarForm({ caption: profile.avatarCaption ?? '' })
                  setIsAvatarEditOpen(true)
                }}
              >
                Edit photo
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAvatarEditOpen}
        onOpenChange={(open) => {
          setIsAvatarEditOpen(open)
          if (!open) {
            setAvatarDraftFile(null)
            resetAvatarForm({ caption: profile.avatarCaption ?? '' })
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{profile.avatarUrl ? 'Edit profile picture' : 'Upload profile picture'}</DialogTitle>
            <DialogDescription>
              Update your profile picture and add a short description if you want extra context.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(event) => void onSubmitAvatar(event)}>
            <div className="overflow-hidden rounded-[14px] border border-border/70 bg-secondary/40">
              {avatarPreviewUrl || profile.avatarUrl ? (
                <img
                  src={avatarPreviewUrl ?? profile.avatarUrl ?? ''}
                  alt={profile.name}
                  className="h-auto max-h-[420px] w-full object-cover"
                />
              ) : (
                <div className="grid h-[320px] place-items-center">
                  <Avatar name={profile.name} className="h-28 w-28 rounded-[22px] text-4xl" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-caption">Description</Label>
              <Textarea
                id="avatar-caption"
                placeholder="Say something short about this profile picture..."
                className="min-h-[110px]"
                {...registerAvatar('caption')}
              />
              {avatarErrors.caption ? <p className="text-sm text-destructive">{avatarErrors.caption.message}</p> : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAvatarEditOpen(false)}>
                Cancel
              </Button>
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[9px] border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent">
                <Upload className="h-4 w-4" />
                {avatarDraftFile ? 'Change selected image' : 'Choose image'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    setAvatarDraftFile(event.target.files?.[0] ?? null)
                  }}
                />
              </label>
              <Button type="submit" disabled={uploadStatus === 'loading'}>
                {uploadStatus === 'loading' ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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


