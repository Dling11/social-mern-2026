import { ImagePlus, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  fetchConversations,
  fetchMessages,
  openConversation,
  receiveMessage,
  sendMessage,
  setActiveConversation,
  setTypingUsers,
  updateMessageStatus,
} from '@/features/message/message-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { messageService } from '@/services/message-service'
import { getSocket } from '@/services/socket-service'
import { formatRelativeDate } from '@/utils/date'

export function MessagesPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const authUser = useAppSelector((state) => state.auth.user)
  const { conversations, activeConversationId, messagesByConversation, typingByConversation, sendStatus } = useAppSelector(
    (state) => state.message,
  )
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    void dispatch(fetchConversations())
  }, [dispatch])

  useEffect(() => {
    const starterId = new URLSearchParams(location.search).get('user')
    if (starterId) {
      void dispatch(openConversation(starterId))
    }
  }, [dispatch, location.search])

  useEffect(() => {
    if (conversationId) {
      dispatch(setActiveConversation(conversationId))
    }
  }, [conversationId, dispatch])

  useEffect(() => {
    if (activeConversationId) {
      void dispatch(fetchMessages(activeConversationId))
      void messageService.markSeen(activeConversationId)
    }
  }, [activeConversationId, dispatch])

  useEffect(() => {
    const socket = getSocket()

    const handleMessage = (message: any) => {
      dispatch(receiveMessage(message))
    }
    const handleStartTyping = (payload: any) => {
      const current = typingByConversation[payload.conversationId] ?? []
      const next = [...current.filter((entry) => entry.userId !== payload.user.id), { userId: payload.user.id, name: payload.user.name }]
      dispatch(setTypingUsers({ conversationId: payload.conversationId, users: next }))
    }
    const handleStopTyping = (payload: any) => {
      const current = typingByConversation[payload.conversationId] ?? []
      dispatch(setTypingUsers({ conversationId: payload.conversationId, users: current.filter((entry) => entry.userId !== payload.userId) }))
    }
    const handleStatus = (payload: any) => {
      dispatch(updateMessageStatus(payload))
    }

    socket.on('message:new', handleMessage)
    socket.on('typing:start', handleStartTyping)
    socket.on('typing:stop', handleStopTyping)
    socket.on('message:status', handleStatus)

    return () => {
      socket.off('message:new', handleMessage)
      socket.off('typing:start', handleStartTyping)
      socket.off('typing:stop', handleStopTyping)
      socket.off('message:status', handleStatus)
    }
  }, [dispatch, typingByConversation])

  useEffect(() => {
    const socket = getSocket()
    if (activeConversationId) {
      socket.emit('conversation:join', activeConversationId)
      return () => {
        socket.emit('conversation:leave', activeConversationId)
      }
    }
  }, [activeConversationId])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  )
  const messages = activeConversationId ? messagesByConversation[activeConversationId] ?? [] : []
  const typingUsers = activeConversationId ? typingByConversation[activeConversationId] ?? [] : []

  const send = async () => {
    if (!activeConversationId || (!text.trim() && !image)) {
      return
    }

    const result = await dispatch(sendMessage({ conversationId: activeConversationId, text: text.trim(), image }))
    if (sendMessage.fulfilled.match(result)) {
      setText('')
      setImage(null)
      getSocket().emit('typing:stop', { conversationId: activeConversationId })
    }
  }

  return (
    <Card className="grid min-h-[72vh] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Conversations</p>
          <p className="mt-1 text-sm text-muted-foreground">Real-time messaging with your friends.</p>
        </div>
        <div className="max-h-[72vh] space-y-2 overflow-y-auto p-3">
          {conversations.map((conversation) => {
            const other = conversation.participants.find((participant) => participant.id !== authUser?.id) ?? conversation.participants[0]
            const isActive = conversation.id === activeConversationId

            return (
              <button
                key={conversation.id}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                onClick={() => {
                  dispatch(setActiveConversation(conversation.id))
                  navigate(`/messages/${conversation.id}`)
                }}
              >
                <p className="font-medium">{other?.name}</p>
                <p className={`mt-1 text-sm ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {conversation.lastMessageText ?? 'Start a conversation'}
                </p>
              </button>
            )
          })}
          {conversations.length === 0 ? <p className="px-3 text-sm text-muted-foreground">No conversations yet.</p> : null}
        </div>
      </div>

      <div className="flex min-h-[72vh] flex-col">
        <div className="border-b border-border px-5 py-4">
          <p className="text-lg font-semibold text-foreground">
            {activeConversation
              ? activeConversation.participants.find((participant) => participant.id !== authUser?.id)?.name
              : 'Select a conversation'}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.map((message) => {
            const isOwn = message.sender.id === authUser?.id
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-[24px] px-4 py-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {message.text ? <p className="text-sm leading-6">{message.text}</p> : null}
                  {message.imageUrl ? (
                    <img src={message.imageUrl} alt="Message attachment" className="mt-2 max-h-72 w-full rounded-2xl object-cover" />
                  ) : null}
                  <p className={`mt-2 text-xs ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {formatRelativeDate(message.createdAt)} {isOwn ? `· ${message.status}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
          {typingUsers.length > 0 ? (
            <p className="text-sm text-muted-foreground">{typingUsers.map((entry) => entry.name).join(', ')} typing...</p>
          ) : null}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex items-end gap-3">
            <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <ImagePlus className="h-4 w-4" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
              />
            </label>
            <textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value)
                if (activeConversationId) {
                  getSocket().emit('typing:start', { conversationId: activeConversationId })
                }
              }}
              onBlur={() => {
                if (activeConversationId) {
                  getSocket().emit('typing:stop', { conversationId: activeConversationId })
                }
              }}
              placeholder={activeConversationId ? 'Write a message...' : 'Select a conversation first'}
              className="min-h-11 flex-1 rounded-[24px] border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="icon" onClick={() => void send()} disabled={!activeConversationId || sendStatus === 'loading'}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {image ? <p className="mt-2 text-sm text-muted-foreground">Attached: {image.name}</p> : null}
        </div>
      </div>
    </Card>
  )
}
