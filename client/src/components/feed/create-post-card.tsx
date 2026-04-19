import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createPostSchema, type CreatePostValues } from '@/features/feed/feed-schemas'
import { createPost } from '@/features/feed/feed-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'

export function CreatePostCard() {
  const dispatch = useAppDispatch()
  const createStatus = useAppSelector((state) => state.feed.createStatus)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
    },
  })

  const content = watch('content')

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(createPost(values))
    if (createPost.fulfilled.match(result)) {
      reset()
    }
  })

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Create Post</p>
          <p className="mt-2 text-sm text-muted-foreground">Share an update with your community.</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {content.length}/1200
        </span>
      </div>

      <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
        <textarea
          {...register('content')}
          className="min-h-32 w-full rounded-[24px] border border-input bg-background px-4 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          placeholder="What’s happening in your world today?"
        />
        {errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={createStatus === 'loading'}>
            {createStatus === 'loading' ? 'Publishing...' : 'Publish post'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
