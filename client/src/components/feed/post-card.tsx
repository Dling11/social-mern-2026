import { zodResolver } from '@hookform/resolvers/zod'
import { MessageCircle, Send, ThumbsUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/shared/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { addCommentSchema, type AddCommentValues } from '@/features/feed/feed-schemas'
import { addComment, togglePostLike } from '@/features/feed/feed-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import type { FeedPost } from '@/types/post'
import { formatRelativeDate } from '@/utils/date'

export function PostCard({ post }: { post: FeedPost }) {
  const dispatch = useAppDispatch()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCommentValues>({
    resolver: zodResolver(addCommentSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(addComment({ postId: post.id, content: values.content }))
    if (addComment.fulfilled.match(result)) {
      reset()
    }
  })

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author.id}`}>
            <Avatar name={post.author.name} src={post.author.avatarUrl} className="h-12 w-12 transition hover:scale-[1.03]" />
          </Link>
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-semibold text-foreground transition hover:text-primary">
              {post.author.name}
            </Link>
            <p className="text-sm text-muted-foreground">{formatRelativeDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {post.author.email}
        </div>
      </div>

      <p className="text-sm leading-7 text-foreground">{post.content}</p>
      {post.imageUrl ? (
        <div className="overflow-hidden rounded-[24px] border border-border">
          <img src={post.imageUrl} alt="Post attachment" className="h-auto max-h-[520px] w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-y border-border py-3">
        <Button
          variant={post.isLiked ? 'default' : 'secondary'}
          size="sm"
          className="cursor-pointer transition hover:scale-[1.02]"
          onClick={() => void dispatch(togglePostLike(post.id))}
        >
          <ThumbsUp className="h-4 w-4" />
          {post.isLiked ? 'Liked' : 'Like'} ({post.likeCount})
        </Button>
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          <MessageCircle className="h-4 w-4" />
          Comments ({post.commentCount})
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Comments</p>
        {post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl bg-secondary/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{comment.author.name}</p>
                <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to respond.</p>
        )}
      </div>

      <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
        <div className="flex gap-3">
          <input
            {...register('content')}
            className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Write a comment..."
          />
          <Button type="submit" size="icon" disabled={isSubmitting} className="cursor-pointer">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}
      </form>
    </Card>
  )
}
