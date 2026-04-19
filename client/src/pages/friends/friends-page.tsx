import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/shared/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  fetchFriendLists,
  removeFriend,
} from '@/features/friend/friend-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'

export function FriendsPage() {
  const dispatch = useAppDispatch()
  const { friends, receivedRequests, sentRequests } = useAppSelector((state) => state.friend)

  useEffect(() => {
    void dispatch(fetchFriendLists())
  }, [dispatch])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
          <CardDescription>Manage your friendships and pending requests in one place.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="incoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-3">
          {receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <FriendRow
                key={request.id}
                name={request.name}
                email={request.email}
                avatarUrl={request.avatarUrl}
                profileTo={`/profile/${request.id}`}
                actions={
                  <>
                    <Button size="sm" onClick={() => void dispatch(acceptFriendRequest(request.id))}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void dispatch(declineFriendRequest(request.id))}>
                      Decline
                    </Button>
                  </>
                }
              />
            ))
          ) : (
            <EmptyCard text="No incoming requests." />
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <FriendRow
                key={request.id}
                name={request.name}
                email={request.email}
                avatarUrl={request.avatarUrl}
                profileTo={`/profile/${request.id}`}
                actions={
                  <Button size="sm" variant="outline" onClick={() => void dispatch(cancelFriendRequest(request.id))}>
                    Cancel
                  </Button>
                }
              />
            ))
          ) : (
            <EmptyCard text="No sent requests." />
          )}
        </TabsContent>

        <TabsContent value="friends" className="space-y-3">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <FriendRow
                key={friend.id}
                name={friend.name}
                email={friend.email}
                avatarUrl={friend.avatarUrl}
                profileTo={`/profile/${friend.id}`}
                actions={
                  <Button size="sm" variant="outline" onClick={() => void dispatch(removeFriend(friend.id))}>
                    Remove
                  </Button>
                }
              />
            ))
          ) : (
            <EmptyCard text="No friends yet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FriendRow({
  name,
  email,
  avatarUrl,
  profileTo,
  actions,
}: {
  name: string
  email: string
  avatarUrl?: string | null
  profileTo: string
  actions: React.ReactNode
}) {
  return (
    <Card className="p-4">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-0">
        <Link to={profileTo} className="flex items-center gap-3 transition hover:opacity-90">
          <Avatar name={name} src={avatarUrl} className="h-12 w-12" />
          <div>
            <p className="font-medium text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </Link>
        <div className="flex gap-2">{actions}</div>
      </CardContent>
    </Card>
  )
}

function EmptyCard({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  )
}
