import { ImagePlus, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Avatar } from '@/components/shared/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createPostSchema, type CreatePostValues } from '@/features/feed/feed-schemas'
import { createPost } from '@/features/feed/feed-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'

export function CreatePostCard() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const createStatus = useAppSelector((state) => state.feed.createStatus)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      image: null,
    },
  })

  const content = watch('content')
  const selectedImage = watch('image')

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedImage)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedImage])

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(createPost(values))
    if (createPost.fulfilled.match(result)) {
      reset()
      setPreviewUrl(null)
    }
  })

  return (
    <Card className="space-y-5 bg-[linear-gradient(180deg,rgba(59,130,246,0.04),transparent)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={user?.name ?? 'You'} src={user?.avatarUrl} className="h-12 w-12" />
          <div>
            <p className="text-sm font-semibold text-foreground">Create Post</p>
            <p className="mt-2 text-sm text-muted-foreground">Share an update with your community.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {content.length}/1200
        </span>
      </div>

      <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
        <textarea
          {...register('content')}
          className="min-h-32 w-full rounded-[24px] border border-input bg-background px-4 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          placeholder="What's happening in your world today?"
        />

        {previewUrl ? (
          <div className="relative overflow-hidden rounded-[24px] border border-border">
            <img src={previewUrl} alt="Selected preview" className="max-h-80 w-full object-cover" />
            <button
              type="button"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-[var(--shadow-soft)] transition hover:scale-105"
              onClick={() => setValue('image', null, { shouldValidate: true })}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80">
            <ImagePlus className="h-4 w-4" />
            Add image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => setValue('image', event.target.files?.[0] ?? null, { shouldValidate: true })}
            />
          </label>
          {selectedImage ? <span className="text-sm text-muted-foreground">{selectedImage.name}</span> : null}
          <span className="text-xs text-muted-foreground">Single image upload is supported right now.</span>
        </div>

        {errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}
        {errors.image ? <p className="text-sm text-destructive">{errors.image.message as string}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={createStatus === 'loading'} className="cursor-pointer">
            {createStatus === 'loading' ? 'Publishing...' : 'Publish post'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
