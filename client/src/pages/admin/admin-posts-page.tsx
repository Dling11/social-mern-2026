import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { deleteAdminPost, fetchAdminPosts } from '@/features/admin/admin-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { formatRelativeDate } from '@/utils/date'

export function AdminPostsPage() {
  const dispatch = useAppDispatch()
  const posts = useAppSelector((state) => state.admin.posts)

  useEffect(() => {
    void dispatch(fetchAdminPosts())
  }, [dispatch])

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="font-semibold text-foreground">{post.authorName}</p>
              <p className="text-sm text-muted-foreground">{post.authorEmail}</p>
              <p className="mt-4 text-sm leading-7 text-foreground">{post.content}</p>
              {post.imageUrl ? (
                <img src={post.imageUrl} alt="Moderated post" className="mt-4 max-h-72 rounded-2xl object-cover" />
              ) : null}
            </div>

            <div className="space-y-3 text-right">
              <p className="text-sm text-muted-foreground">{formatRelativeDate(post.createdAt)}</p>
              <p className="text-sm text-muted-foreground">
                {post.likeCount} likes · {post.commentCount} comments
              </p>
              <Button variant="outline" onClick={() => void dispatch(deleteAdminPost(post.id))}>
                Delete Post
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {posts.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">No posts to moderate right now.</p>
        </Card>
      ) : null}
    </div>
  )
}
