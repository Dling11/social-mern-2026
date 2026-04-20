import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { feedService } from '@/services/feed-service'
import type { FeedPost } from '@/types/post'

interface FeedState {
  posts: FeedPost[]
  status: 'idle' | 'loading' | 'failed'
  createStatus: 'idle' | 'loading' | 'failed'
}

const initialState: FeedState = {
  posts: [],
  status: 'idle',
  createStatus: 'idle',
}

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async (_, { rejectWithValue }) => {
  try {
    return await feedService.getFeed()
  } catch (error) {
    return rejectWithValue(feedService.getErrorMessage(error))
  }
})

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (payload: { content: string; image?: File | null }, { rejectWithValue }) => {
    try {
      return await feedService.createPost(payload)
    } catch (error) {
      return rejectWithValue(feedService.getErrorMessage(error))
    }
  },
)

export const togglePostLike = createAsyncThunk(
  'feed/toggleLike',
  async (postId: string, { rejectWithValue }) => {
    try {
      return await feedService.toggleLike(postId)
    } catch (error) {
      return rejectWithValue(feedService.getErrorMessage(error))
    }
  },
)

export const addComment = createAsyncThunk(
  'feed/addComment',
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      return await feedService.addComment(postId, { content })
    } catch (error) {
      return rejectWithValue(feedService.getErrorMessage(error))
    }
  },
)

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    upsertFeedPost(state, action: { payload: FeedPost }) {
      insertOrReplacePost(state.posts, action.payload)
    },
    replaceFeedPost(state, action: { payload: FeedPost }) {
      state.posts = state.posts.map((post) => (post.id === action.payload.id ? action.payload : post))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.status = 'idle'
        state.posts = action.payload
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to load the feed right now.')
      })
      .addCase(createPost.pending, (state) => {
        state.createStatus = 'loading'
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = 'idle'
        insertOrReplacePost(state.posts, action.payload)
        toast.success('Post published.')
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = 'failed'
        toast.error((action.payload as string) ?? 'Unable to publish your post.')
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) => (post.id === action.payload.id ? action.payload : post))
      })
      .addCase(togglePostLike.rejected, (_state, action) => {
        toast.error((action.payload as string) ?? 'Unable to update the like right now.')
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) => (post.id === action.payload.id ? action.payload : post))
        toast.success('Comment added.')
      })
      .addCase(addComment.rejected, (_state, action) => {
        toast.error((action.payload as string) ?? 'Unable to add your comment.')
      })
  },
})

function insertOrReplacePost(posts: FeedPost[], incomingPost: FeedPost) {
  const existingIndex = posts.findIndex((post) => post.id === incomingPost.id)
  if (existingIndex >= 0) {
    posts.splice(existingIndex, 1)
  }

  posts.unshift(incomingPost)
}

export const { replaceFeedPost, upsertFeedPost } = feedSlice.actions
export default feedSlice.reducer
