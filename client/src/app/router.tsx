import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AdminRoute } from '@/components/shared/admin-route'
import { AdminLayout } from '@/layouts/admin-layout'
import { ProtectedRoute } from '@/components/shared/protected-route'
import { AdminOverviewPage } from '@/pages/admin/admin-overview-page'
import { AdminPostsPage } from '@/pages/admin/admin-posts-page'
import { AdminUsersPage } from '@/pages/admin/admin-users-page'
import { AuthLayout } from '@/layouts/auth-layout'
import { MainLayout } from '@/layouts/main-layout'
import { LoginPage } from '@/pages/auth/login-page'
import { RegisterPage } from '@/pages/auth/register-page'
import { FeedPage } from '@/pages/feed/feed-page'
import { DiscoverPage } from '@/pages/discover/discover-page'
import { FriendsPage } from '@/pages/friends/friends-page'
import { MessagesPage } from '@/pages/messages/messages-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { NotificationsPage } from '@/pages/notifications/notifications-page'
import { ProfilePage } from '@/pages/profile/profile-page'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/feed" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin', element: <AdminOverviewPage /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/posts', element: <AdminPostsPage /> },
            ],
          },
        ],
      },
      {
        element: <MainLayout />,
        children: [
          { path: '/feed', element: <FeedPage /> },
          { path: '/discover', element: <DiscoverPage /> },
          { path: '/friends', element: <FriendsPage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/messages/:conversationId', element: <MessagesPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/profile/:userId', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
