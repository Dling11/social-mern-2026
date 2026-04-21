import { useEffect } from 'react'
import {
  clearConversationUnread,
  receiveMessage,
  typingStarted,
  typingStopped,
  updateMessageStatus,
  upsertConversation,
} from '@/features/message/message-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { getSocket } from '@/services/socket-service'
import type { ChatMessage, ConversationSummary } from '@/types/message'

interface TypingStartPayload {
  conversationId: string
  user: {
    id: string
    name: string
  }
}

interface TypingStopPayload {
  conversationId: string
  userId: string
}

interface MessageStatusPayload {
  messageId: string
  conversationId: string
  status: ChatMessage['status']
  seenAt?: string | null
}

export function useMessageSocket() {
  const dispatch = useAppDispatch()
  const activeConversationId = useAppSelector((state) => state.message.activeConversationId)

  useEffect(() => {
    const socket = getSocket()

    const handleMessage = (message: ChatMessage) => {
      dispatch(receiveMessage(message))
    }

    const handleStartTyping = (payload: TypingStartPayload) => {
      dispatch(typingStarted(payload))
    }

    const handleStopTyping = (payload: TypingStopPayload) => {
      dispatch(typingStopped(payload))
    }

    const handleStatus = (payload: MessageStatusPayload) => {
      dispatch(updateMessageStatus(payload))
    }

    const handleConversationUpdated = (conversation: ConversationSummary) => {
      dispatch(upsertConversation(conversation))
      if (conversation.id === activeConversationId && conversation.unreadCount > 0) {
        dispatch(clearConversationUnread(conversation.id))
      }
    }

    socket.on('message:new', handleMessage)
    socket.on('typing:start', handleStartTyping)
    socket.on('typing:stop', handleStopTyping)
    socket.on('message:status', handleStatus)
    socket.on('conversation:updated', handleConversationUpdated)

    return () => {
      socket.off('message:new', handleMessage)
      socket.off('typing:start', handleStartTyping)
      socket.off('typing:stop', handleStopTyping)
      socket.off('message:status', handleStatus)
      socket.off('conversation:updated', handleConversationUpdated)
    }
  }, [activeConversationId, dispatch])
}
