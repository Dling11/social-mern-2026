import { ImagePlus, Search, Send, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/shared/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { fetchFriendLists } from '@/features/friend/friend-slice'
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
import type { AuthUser } from '@/types/auth'
import { formatRelativeDate } from '@/utils/date'

function getConversationPeer(participants: AuthUser[], authUserId?: string) {
  return participants.find((participant) => participant.id !== authUserId) ?? participants[0] ?? null
}

export function MessagesPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const authUser = useAppSelector((state) => state.auth.user)
  const friends = useAppSelector((state) => state.friend.friends)
  const { conversations, activeConversationId, messagesByConversation, typingByConversation, sendStatus } = useAppSelector(
    (state) => state.message,
  )
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [conversationSearch, setConversationSearch] = useState('')

  useEffect(() => {
    void dispatch(fetchConversations())
    void dispatch(fetchFriendLists())
  }, [dispatch])

  useEffect(() => {
    const starterId = new URLSearchParams(location.search).get('user')
    if (!starterId) {
      return
    }

    void dispatch(openConversation(starterId)).then((result) => {
      if (openConversation.fulfilled.match(result)) {
        navigate(`/messages/${result.payload.id}`, { replace: true })
      }
    })
  }, [dispatch, location.search, navigate])

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

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase()

    if (!query) {
      return conversations
    }

    return conversations.filter((conversation) => {
      const other = getConversationPeer(conversation.participants, authUser?.id)
      return (
        other?.name.toLowerCase().includes(query) ||
        other?.email.toLowerCase().includes(query) ||
        (other?.username?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [authUser?.id, conversationSearch, conversations])

  const friendsWithoutConversation = useMemo(() => {
    const currentPeerIds = new Set(
      conversations
        .map((conversation) => getConversationPeer(conversation.participants, authUser?.id)?.id)
        .filter((value): value is string => Boolean(value)),
    )

    return friends.filter((friend) => !currentPeerIds.has(friend.id))
  }, [authUser?.id, conversations, friends])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  )

  const activePeer = activeConversation ? getConversationPeer(activeConversation.participants, authUser?.id) : null
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

  const startConversationWithFriend = async (friendId: string) => {
    const result = await dispatch(openConversation(friendId))
    if (openConversation.fulfilled.match(result)) {
      navigate(`/messages/${result.payload.id}`)
    }
  }

  return (
    <Card className="grid min-h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[360px_minmax(0,1fr)] xl:min-h-[calc(100vh-7.5rem)]">
      <aside className="flex min-h-0 flex-col border-b border-border/70 bg-secondary/20 lg:border-b-0 lg:border-r">
        <div className="space-y-4 border-b border-border/70 px-5 py-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Messages</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Pick an existing conversation or start one with a friend below.
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              className="pl-10"
              placeholder="Search conversations"
            />
          </div>
        </div>

        <div className="max-h-[32rem] space-y-5 overflow-y-auto px-4 py-4 lg:max-h-none lg:flex-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Recent chats</p>
              <Badge variant="secondary">{conversations.length}</Badge>
            </div>

            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const other = getConversationPeer(conversation.participants, authUser?.id)
                const isActive = conversation.id === activeConversationId

                return (
                  <button
                    key={conversation.id}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-3 text-left transition ${
                      isActive
                        ? 'border-primary/30 bg-primary/10 shadow-sm'
                        : 'border-transparent bg-background/75 hover:border-border hover:bg-card'
                    }`}
                    onClick={() => {
                      dispatch(setActiveConversation(conversation.id))
                      navigate(`/messages/${conversation.id}`)
                    }}
                  >
                    <Avatar name={other?.name ?? 'Unknown'} src={other?.avatarUrl} className="h-12 w-12 rounded-[10px]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-medium text-foreground">{other?.name ?? 'Unknown user'}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {conversation.lastMessageAt ? formatRelativeDate(conversation.lastMessageAt) : ''}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.lastMessageText ?? 'No messages yet'}
                      </p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="rounded-[10px] border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                No matching conversations yet.
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Start with friends</p>
              <Badge variant="secondary">{friendsWithoutConversation.length}</Badge>
            </div>

            {friendsWithoutConversation.length > 0 ? (
              friendsWithoutConversation.slice(0, 8).map((friend) => (
                <button
                  key={friend.id}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border border-transparent bg-background/75 px-3 py-3 text-left transition hover:border-border hover:bg-card"
                  onClick={() => void startConversationWithFriend(friend.id)}
                >
                  <Avatar name={friend.name} src={friend.avatarUrl} className="h-11 w-11 rounded-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{friend.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{friend.username ? `@${friend.username}` : friend.email}</p>
                  </div>
                  <Badge>Chat</Badge>
                </button>
              ))
            ) : (
              <div className="rounded-[10px] border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                All available friends already have conversations, or you do not have friends added yet.
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
          {activePeer ? (
            <div className="flex items-center gap-3">
              <Avatar name={activePeer.name} src={activePeer.avatarUrl} className="h-12 w-12 rounded-[10px]" />
              <div>
                <p className="font-semibold text-foreground">{activePeer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {typingUsers.length > 0 ? `${typingUsers.map((entry) => entry.name).join(', ')} typing...` : 'Conversation active'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-foreground">Select a conversation</p>
              <p className="text-sm text-muted-foreground">Choose a recent chat or start one with a friend from the left panel.</p>
            </div>
          )}

          {activePeer ? <Badge variant="outline">{messages.length} messages</Badge> : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.35),transparent)] px-5 py-5">
          {activeConversationId ? (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border bg-background/80 p-5 text-sm text-muted-foreground">
                  This conversation is ready. Send the first message to get things started.
                </div>
              ) : null}

              {messages.map((message) => {
                const isOwn = message.sender.id === authUser?.id

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn ? (
                        <Avatar name={message.sender.name} src={message.sender.avatarUrl} className="h-9 w-9 rounded-[10px]" />
                      ) : null}
                      <div
                        className={`rounded-[14px] border px-4 py-3 shadow-sm ${
                          isOwn
                            ? 'border-primary/20 bg-primary text-primary-foreground'
                            : 'border-border/70 bg-card text-foreground'
                        }`}
                      >
                        {message.text ? <p className="text-sm leading-6">{message.text}</p> : null}
                        {message.imageUrl ? (
                          <img src={message.imageUrl} alt="Message attachment" className="mt-2 max-h-72 w-full rounded-[10px] object-cover" />
                        ) : null}
                        <p className={`mt-2 text-xs ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {formatRelativeDate(message.createdAt)}
                          {isOwn ? ` · ${message.status}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid h-full place-items-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[10px] bg-primary/10 text-primary">
                  <UserRound className="h-6 w-6" />
                </div>
                <p className="text-xl font-semibold text-foreground">Your inbox is ready</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Start by choosing a recent conversation on the left, or click one of your friends under
                  {' '}
                  <span className="font-medium text-foreground">Start with friends</span>
                  .
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/70 bg-card/80 px-5 py-4">
          <div className="rounded-[12px] border border-border/70 bg-background/90 p-3 shadow-sm">
            {image ? (
              <div className="mb-3 flex items-center justify-between rounded-[10px] bg-secondary/40 px-3 py-2 text-sm text-foreground">
                <span className="truncate pr-3">Attached image: {image.name}</span>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1 text-muted-foreground transition hover:text-foreground"
                  onClick={() => setImage(null)}
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ) : null}

            <div className="flex items-end gap-3">
              <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-secondary/50 text-secondary-foreground transition hover:bg-secondary">
                <ImagePlus className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                  disabled={!activeConversationId}
                />
              </label>

              <Textarea
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
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void send()
                  }
                }}
                placeholder={activeConversationId ? 'Write a message...' : 'Choose a conversation to start typing'}
                className="min-h-[52px] flex-1 resize-none"
                disabled={!activeConversationId}
              />

              <Button size="icon" onClick={() => void send()} disabled={!activeConversationId || sendStatus === 'loading'}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Press
              {' '}
              <span className="font-medium text-foreground">Enter</span>
              {' '}
              to send, or
              {' '}
              <span className="font-medium text-foreground">Shift + Enter</span>
              {' '}
              for a new line.
            </p>
          </div>
        </div>
      </section>
    </Card>
  )
}
