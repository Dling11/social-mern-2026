import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The route you requested has not been created yet.</p>
        <Link to="/feed">
          <Button className="mt-6">Go to feed</Button>
        </Link>
      </div>
    </div>
  )
}
