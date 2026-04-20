import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RouteLoader } from '@/components/shared/route-loader'
import { AdminRoute } from '@/components/shared/admin-route'
import { ProtectedRoute } from '@/components/shared/protected-route'

const AuthLayout = lazy(() => import('@/layouts/auth-layout').then((module) => ({ default: module.AuthLayout })))
const MainLayout = lazy(() => import('@/layouts/main-layout').then((module) => ({ default: module.MainLayout })))
const AdminLayout = lazy(() => import('@/layouts/admin-layout').then((module) => ({ default: module.AdminLayout })))
const LoginPage = lazy(() => import('@/pages/auth/login-page').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/register-page').then((module) => ({ default: module.RegisterPage })))
const FeedPage = lazy(() => import('@/pages/feed/feed-page').then((module) => ({ default: module.FeedPage })))
const DiscoverPage = lazy(() => import('@/pages/discover/discover-page').then((module) => ({ default: module.DiscoverPage })))
const FriendsPage = lazy(() => import('@/pages/friends/friends-page').then((module) => ({ default: module.FriendsPage })))
const MessagesPage = lazy(() => import('@/pages/messages/messages-page').then((module) => ({ default: module.MessagesPage })))
const NotificationsPage = lazy(() =>
  import('@/pages/notifications/notifications-page').then((module) => ({ default: module.NotificationsPage })),
)
const ProfilePage = lazy(() => import('@/pages/profile/profile-page').then((module) => ({ default: module.ProfilePage })))
const AdminOverviewPage = lazy(() =>
  import('@/pages/admin/admin-overview-page').then((module) => ({ default: module.AdminOverviewPage })),
)
const AdminUsersPage = lazy(() => import('@/pages/admin/admin-users-page').then((module) => ({ default: module.AdminUsersPage })))
const AdminPostsPage = lazy(() => import('@/pages/admin/admin-posts-page').then((module) => ({ default: module.AdminPostsPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/feed" replace />,
  },
  {
    element: withSuspense(<AuthLayout />),
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            element: withSuspense(<AdminLayout />),
            children: [
              { path: '/admin', element: withSuspense(<AdminOverviewPage />) },
              { path: '/admin/users', element: withSuspense(<AdminUsersPage />) },
              { path: '/admin/posts', element: withSuspense(<AdminPostsPage />) },
            ],
          },
        ],
      },
      {
        element: withSuspense(<MainLayout />),
        children: [
          { path: '/feed', element: withSuspense(<FeedPage />) },
          { path: '/discover', element: withSuspense(<DiscoverPage />) },
          { path: '/friends', element: withSuspense(<FriendsPage />) },
          { path: '/messages', element: withSuspense(<MessagesPage />) },
          { path: '/messages/:conversationId', element: withSuspense(<MessagesPage />) },
          { path: '/notifications', element: withSuspense(<NotificationsPage />) },
          { path: '/profile', element: withSuspense(<ProfilePage />) },
          { path: '/profile/:userId', element: withSuspense(<ProfilePage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
