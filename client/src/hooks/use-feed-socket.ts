import { useEffect } from 'react'
import { replaceFeedPost, upsertFeedPost } from '@/features/feed/feed-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { getSocket } from '@/services/socket-service'
import type { FeedPost } from '@/types/post'

interface UseFeedSocketOptions {
  onNewPost?: (post: FeedPost) => void
  onUpdatedPost?: (post: FeedPost) => void
}

export function useFeedSocket(options: UseFeedSocketOptions = {}) {
  const dispatch = useAppDispatch()
  const { onNewPost, onUpdatedPost } = options

  useEffect(() => {
    const socket = getSocket()

    const handleNewPost = (post: FeedPost) => {
      dispatch(upsertFeedPost(post))
      onNewPost?.(post)
    }

    const handleUpdatedPost = (post: FeedPost) => {
      dispatch(replaceFeedPost(post))
      onUpdatedPost?.(post)
    }

    socket.on('feed:post:new', handleNewPost)
    socket.on('feed:post:updated', handleUpdatedPost)

    return () => {
      socket.off('feed:post:new', handleNewPost)
      socket.off('feed:post:updated', handleUpdatedPost)
    }
  }, [dispatch, onNewPost, onUpdatedPost])
}
