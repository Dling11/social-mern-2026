import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000', {
      withCredentials: true,
    })
  }

  return socket
}
