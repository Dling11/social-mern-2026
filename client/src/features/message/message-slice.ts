import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { messageService } from '@/services/message-service'
import type { ChatMessage, ConversationSummary } from '@/types/message'

interface MessageState {
  conversations: ConversationSummary[]
  activeConversationId: string | null
  messagesByConversation: Record<string, ChatMessage[]>
  typingByConversation: Record<string, Array<{ userId: string; name: string }>>
  status: 'idle' | 'loading' | 'failed'
  sendStatus: 'idle' | 'loading' | 'failed'
}

const initialState: MessageState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  typingByConversation: {},
  status: 'idle',
  sendStatus: 'idle',
}

export const fetchConversations = createAsyncThunk('message/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    return await messageService.getConversations()
  } catch (error) {
    return rejectWithValue(messageService.getErrorMessage(error))
  }
})

export const openConversation = createAsyncThunk('message/openConversation', async (userId: string, { rejectWithValue }) => {
  try {
    return await messageService.openConversation(userId)
  } catch (error) {
    return rejectWithValue(messageService.getErrorMessage(error))
  }
})

export const fetchMessages = createAsyncThunk('message/fetchMessages', async (conversationId: string, { rejectWithValue }) => {
  try {
    return {
      conversationId,
      messages: await messageService.getMessages(conversationId),
    }
  } catch (error) {
    return rejectWithValue(messageService.getErrorMessage(error))
  }
})

export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (payload: { conversationId: string; text?: string; image?: File | null }, { rejectWithValue }) => {
    try {
      return await messageService.sendMessage(payload.conversationId, payload)
    } catch (error) {
      return rejectWithValue(messageService.getErrorMessage(error))
    }
  },
)

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload
    },
    receiveMessage(state, action) {
      const message = action.payload as ChatMessage
      const existing = state.messagesByConversation[message.conversationId] ?? []
      if (!existing.some((item) => item.id === message.id)) {
        state.messagesByConversation[message.conversationId] = [...existing, message]
      }
      updateConversationPreview(state.conversations, message)
    },
    updateMessageStatus(
      state,
      action: { payload: { messageId: string; conversationId: string; status: ChatMessage['status']; seenAt?: string | null } },
    ) {
      const { conversationId, messageId, status, seenAt } = action.payload
      state.messagesByConversation[conversationId] = (state.messagesByConversation[conversationId] ?? []).map((message) =>
        message.id === messageId ? { ...message, status, seenAt: seenAt ?? null } : message,
      )
    },
    setTypingUsers(state, action: { payload: { conversationId: string; users: Array<{ userId: string; name: string }> } }) {
      state.typingByConversation[action.payload.conversationId] = action.payload.users
    },
    typingStarted(state, action: { payload: { conversationId: string; user: { id: string; name: string } } }) {
      const { conversationId, user } = action.payload
      const current = state.typingByConversation[conversationId] ?? []
      state.typingByConversation[conversationId] = [
        ...current.filter((entry) => entry.userId !== user.id),
        { userId: user.id, name: user.name },
      ]
    },
    typingStopped(state, action: { payload: { conversationId: string; userId: string } }) {
      const { conversationId, userId } = action.payload
      const current = state.typingByConversation[conversationId] ?? []
      state.typingByConversation[conversationId] = current.filter((entry) => entry.userId !== userId)
    },
    upsertConversation(state, action: { payload: ConversationSummary }) {
      const existingIndex = state.conversations.findIndex((conversation) => conversation.id === action.payload.id)
      if (existingIndex >= 0) {
        state.conversations.splice(existingIndex, 1)
      }

      state.conversations.unshift(action.payload)
    },
    clearConversationUnread(state, action: { payload: string }) {
      const conversation = state.conversations.find((item) => item.id === action.payload)
      if (conversation) {
        conversation.unreadCount = 0
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = 'idle'
        state.conversations = action.payload
        if (!state.activeConversationId && action.payload[0]) {
          state.activeConversationId = action.payload[0].id
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed'
        toast.error((action.payload as string) ?? 'Unable to load conversations.')
      })
      .addCase(openConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some((conversation) => conversation.id === action.payload.id)
        if (!exists) {
          state.conversations.unshift(action.payload)
        }
        state.activeConversationId = action.payload.id
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesByConversation[action.payload.conversationId] = action.payload.messages
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = 'loading'
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendStatus = 'idle'
        const message = action.payload
        const existing = state.messagesByConversation[message.conversationId] ?? []
        if (!existing.some((item) => item.id === message.id)) {
          state.messagesByConversation[message.conversationId] = [...existing, message]
        }
        updateConversationPreview(state.conversations, message)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendStatus = 'failed'
        toast.error((action.payload as string) ?? 'Unable to send message.')
      })
  },
})

function updateConversationPreview(conversations: ConversationSummary[], message: ChatMessage) {
  const conversation = conversations.find((item) => item.id === message.conversationId)
  if (conversation) {
    conversation.lastMessageText = message.text ?? 'Sent an image'
    conversation.lastMessageAt = message.createdAt
  }
}

export const {
  clearConversationUnread,
  receiveMessage,
  setActiveConversation,
  setTypingUsers,
  typingStarted,
  typingStopped,
  updateMessageStatus,
  upsertConversation,
} = messageSlice.actions
export default messageSlice.reducer
