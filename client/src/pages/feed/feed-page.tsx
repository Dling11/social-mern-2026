import { useEffect } from 'react'
import { CreatePostCard } from '@/components/feed/create-post-card'
import { FeedSkeleton } from '@/components/feed/feed-skeleton'
import { PostCard } from '@/components/feed/post-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchFeed } from '@/features/feed/feed-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { useFeedSocket } from '@/hooks/use-feed-socket'

export function FeedPage() {
  const dispatch = useAppDispatch()
  const { posts, status } = useAppSelector((state) => state.feed)

  useFeedSocket()

  useEffect(() => {
    void dispatch(fetchFeed())
  }, [dispatch])

  if (status === 'loading') {
    return <FeedSkeleton />
  }

  return (
    <div className="space-y-4">
      <CreatePostCard />

      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <Card className="text-center">
          <p className="text-lg font-semibold text-foreground">Your feed is ready</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Publish the first post to start shaping the Phase 2 social experience.
          </p>
          <Button className="mt-6" onClick={() => void dispatch(fetchFeed())} variant="secondary">
            Refresh feed
          </Button>
        </Card>
      )}
    </div>
  )
}
