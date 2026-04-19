import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/use-app-selector'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping } = useAppSelector((state) => state.auth)

  if (isBootstrapping) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
