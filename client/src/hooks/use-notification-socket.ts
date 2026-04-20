import { useEffect } from 'react'
import { receiveNotification } from '@/features/notification/notification-slice'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { getSocket } from '@/services/socket-service'
import type { AppNotification } from '@/types/notification'

export function useNotificationSocket() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const socket = getSocket()

    const handleNotification = (notification: AppNotification) => {
      dispatch(receiveNotification(notification))
    }

    socket.on('notification:new', handleNotification)

    return () => {
      socket.off('notification:new', handleNotification)
    }
  }, [dispatch])
}
