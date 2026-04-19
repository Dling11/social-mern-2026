import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { userService } from '@/services/user-service'
import type { AuthUser } from '@/types/auth'

export function DiscoverPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [users, setUsers] = useState<AuthUser[]>([])

  useEffect(() => {
    const run = async () => {
      if (!query.trim()) {
        setUsers([])
        return
      }

      const result = await userService.searchUsers(query)
      setUsers(result)
    }

    void run()
  }, [query])

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-primary" />
          <div>
            <p className="text-lg font-semibold text-foreground">Discover People</p>
            <p className="text-sm text-muted-foreground">Results for "{query || '...'}"</p>
          </div>
        </div>
      </Card>
      {users.map((user) => (
        <Link key={user.id} to={`/profile/${user.id}`}>
          <Card className="flex items-center gap-3 transition hover:bg-accent/60">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary font-semibold text-primary">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </Card>
        </Link>
      ))}
      {query && users.length === 0 ? <Card><p className="text-sm text-muted-foreground">No users found.</p></Card> : null}
    </div>
  )
}
