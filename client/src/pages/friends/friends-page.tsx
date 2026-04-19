import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
        <p className="text-lg font-semibold text-foreground">Friends</p>
        <p className="mt-2 text-sm text-muted-foreground">Manage your connections and pending requests.</p>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Incoming Requests</h2>
        {receivedRequests.length > 0 ? (
          receivedRequests.map((request) => (
            <Card key={request.id} className="flex flex-wrap items-center justify-between gap-4">
              <Link to={`/profile/${request.id}`} className="flex items-center gap-3">
                <Avatar user={request} />
                <div>
                  <p className="font-medium text-foreground">{request.name}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                </div>
              </Link>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => void dispatch(acceptFriendRequest(request.id))}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => void dispatch(declineFriendRequest(request.id))}>Decline</Button>
              </div>
            </Card>
          ))
        ) : (
          <Card><p className="text-sm text-muted-foreground">No incoming requests.</p></Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sent Requests</h2>
        {sentRequests.length > 0 ? (
          sentRequests.map((request) => (
            <Card key={request.id} className="flex flex-wrap items-center justify-between gap-4">
              <Link to={`/profile/${request.id}`} className="flex items-center gap-3">
                <Avatar user={request} />
                <div>
                  <p className="font-medium text-foreground">{request.name}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                </div>
              </Link>
              <Button size="sm" variant="outline" onClick={() => void dispatch(cancelFriendRequest(request.id))}>
                Cancel
              </Button>
            </Card>
          ))
        ) : (
          <Card><p className="text-sm text-muted-foreground">No sent requests.</p></Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your Friends</h2>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <Card key={friend.id} className="flex flex-wrap items-center justify-between gap-4">
              <Link to={`/profile/${friend.id}`} className="flex items-center gap-3">
                <Avatar user={friend} />
                <div>
                  <p className="font-medium text-foreground">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">{friend.email}</p>
                </div>
              </Link>
              <Button size="sm" variant="outline" onClick={() => void dispatch(removeFriend(friend.id))}>
                Remove
              </Button>
            </Card>
          ))
        ) : (
          <Card><p className="text-sm text-muted-foreground">No friends yet.</p></Card>
        )}
      </section>
    </div>
  )
}

function Avatar({ user }: { user: { name: string; avatarUrl?: string | null } }) {
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-2xl object-cover" />
  ) : (
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary font-semibold text-primary">{user.name.charAt(0)}</div>
  )
}
