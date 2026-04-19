import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { parse as parseCookie } from 'cookie'
import { env } from './config/env'
import { authService } from './services/auth.service'

const onlineUsers = new Map<string, Set<string>>()
let io: Server | null = null

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGINS,
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie ?? ''
      const cookies = parseCookie(rawCookie)
      const token = cookies.token

      if (!token) {
        return next(new Error('Authentication required'))
      }

      const user = await authService.getUserFromToken(token)
      socket.data.user = user
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    socket.join(`user:${user.id}`)
    trackOnline(user.id, socket.id)

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
    })

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    socket.on('typing:start', (payload: { conversationId: string }) => {
      socket.to(`conversation:${payload.conversationId}`).emit('typing:start', {
        conversationId: payload.conversationId,
        user,
      })
    })

    socket.on('typing:stop', (payload: { conversationId: string }) => {
      socket.to(`conversation:${payload.conversationId}`).emit('typing:stop', {
        conversationId: payload.conversationId,
        userId: user.id,
      })
    })

    socket.on('disconnect', () => {
      untrackOnline(user.id, socket.id)
    })
  })

  return io
}

export function getIo() {
  if (!io) {
    throw new Error('Socket.io has not been initialized.')
  }

  return io
}

export function isUserOnline(userId: string) {
  return (onlineUsers.get(userId)?.size ?? 0) > 0
}

function trackOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId) ?? new Set<string>()
  sockets.add(socketId)
  onlineUsers.set(userId, sockets)
}

function untrackOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId)
  if (!sockets) {
    return
  }

  sockets.delete(socketId)
  if (sockets.size === 0) {
    onlineUsers.delete(userId)
  }
}
