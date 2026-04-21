import { MessageCircleMore } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/shared/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppSelector } from '@/hooks/use-app-selector'
import type { AuthUser } from '@/types/auth'
import { formatRelativeDate } from '@/utils/date'

function getConversationPeer(participants: AuthUser[], authUserId?: string) {
  return participants.find((participant) => participant.id !== authUserId) ?? participants[0] ?? null
}

export function MessagePanel() {
  const navigate = useNavigate()
  const authUser = useAppSelector((state) => state.auth.user)
  const conversations = useAppSelector((state) => state.message.conversations)

  return (
    <Card className="p-0">
      <CardHeader className="flex-row items-center justify-between border-b border-border/70 px-5 py-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            Messages
          </CardTitle>
          <CardDescription>Recent chats and unread conversations.</CardDescription>
        </div>
        <Button size="sm" variant="ghost" onClick={() => navigate('/messages')}>
          Open inbox
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-[28rem]">
          <div className="space-y-2 p-4">
            {conversations.slice(0, 8).map((conversation) => {
              const peer = getConversationPeer(conversation.participants, authUser?.id)

              return (
                <button
                  key={conversation.id}
                  className={`w-full rounded-[10px] border px-4 py-3 text-left transition ${
                    conversation.unreadCount > 0
                      ? 'border-primary/20 bg-primary/5 hover:bg-primary/8'
                      : 'border-border/70 bg-background/70 hover:bg-accent/40'
                  }`}
                  onClick={() => navigate(`/messages/${conversation.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={peer?.name ?? 'Unknown'} src={peer?.avatarUrl} className="h-11 w-11 rounded-[10px]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-foreground">{peer?.name ?? 'Unknown user'}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {conversation.lastMessageAt ? formatRelativeDate(conversation.lastMessageAt) : ''}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-muted-foreground">
                          {conversation.lastMessageText ?? 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            {conversations.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations yet.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
