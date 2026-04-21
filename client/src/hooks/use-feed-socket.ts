import { useEffect, useRef } from 'react'
import { replaceFeedPost, upsertFeedPost } from '@/features/feed/feed-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { getSocket } from '@/services/socket-service'
import type { FeedPost, FeedPostRealtimeUpdate } from '@/types/post'

interface UseFeedSocketOptions {
  onNewPost?: (post: FeedPost) => void
  onUpdatedPost?: (post: FeedPost) => void
}

export function useFeedSocket(options: UseFeedSocketOptions = {}) {
  const dispatch = useAppDispatch()
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null)
  const feedPosts = useAppSelector((state) => state.feed.posts)
  const { onNewPost, onUpdatedPost } = options
  const feedPostsRef = useRef(feedPosts)

  useEffect(() => {
    feedPostsRef.current = feedPosts
  }, [feedPosts])

  useEffect(() => {
    const socket = getSocket()

    const handleNewPost = (post: FeedPost) => {
      dispatch(upsertFeedPost(post))
      onNewPost?.(post)
    }

    const handleUpdatedPost = (payload: FeedPostRealtimeUpdate) => {
      const existingPost = feedPostsRef.current.find((post) => post.id === payload.post.id)

      const mergedPost =
        existingPost && payload.actorId !== authUserId
          ? {
              ...payload.post,
              isLiked: existingPost.isLiked,
            }
          : payload.post

      dispatch(replaceFeedPost(mergedPost))
      onUpdatedPost?.(mergedPost)
    }

    socket.on('feed:post:new', handleNewPost)
    socket.on('feed:post:updated', handleUpdatedPost)

    return () => {
      socket.off('feed:post:new', handleNewPost)
      socket.off('feed:post:updated', handleUpdatedPost)
    }
  }, [authUserId, dispatch, onNewPost, onUpdatedPost])
}
