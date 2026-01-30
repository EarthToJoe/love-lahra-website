import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export const initSocket = (server: NetServer): ServerIO => {
  const io = new ServerIO(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Handle connection events
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join user to their personal room for notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`)
      console.log(`User ${userId} joined their room`)
    })

    // Join poll room for real-time voting updates
    socket.on('join-poll', (pollId: string) => {
      socket.join(`poll-${pollId}`)
      console.log(`Socket ${socket.id} joined poll ${pollId}`)
    })

    // Leave poll room
    socket.on('leave-poll', (pollId: string) => {
      socket.leave(`poll-${pollId}`)
      console.log(`Socket ${socket.id} left poll ${pollId}`)
    })

    // Join comment thread for real-time updates
    socket.on('join-comments', (contentId: string) => {
      socket.join(`comments-${contentId}`)
      console.log(`Socket ${socket.id} joined comments for ${contentId}`)
    })

    // Leave comment thread
    socket.on('leave-comments', (contentId: string) => {
      socket.leave(`comments-${contentId}`)
      console.log(`Socket ${socket.id} left comments for ${contentId}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

// Event types for type safety
export interface ServerToClientEvents {
  'poll-update': (data: { pollId: string; results: any }) => void
  'new-comment': (data: { contentId: string; comment: any }) => void
  'comment-update': (data: { commentId: string; comment: any }) => void
  'notification': (data: { userId: string; notification: any }) => void
}

export interface ClientToServerEvents {
  'join-user-room': (userId: string) => void
  'join-poll': (pollId: string) => void
  'leave-poll': (pollId: string) => void
  'join-comments': (contentId: string) => void
  'leave-comments': (contentId: string) => void
}