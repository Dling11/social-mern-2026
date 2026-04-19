import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/use-app-selector'

export function AdminRoute() {
  const user = useAppSelector((state) => state.auth.user)

  if (user?.role !== 'admin') {
    return <Navigate to="/feed" replace />
  }

  return <Outlet />
}
