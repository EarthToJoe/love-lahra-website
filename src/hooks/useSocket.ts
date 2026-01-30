'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketOptions {
  autoConnect?: boolean
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    // Initialize socket connection
    const socket = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to Socket.io server')
      setIsConnected(true)
      setError(null)

      // Join user room if authenticated
      if (session?.user?.email) {
        socket.emit('join-user-room', session.user.email)
      }
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err)
      setError(err.message)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [autoConnect, session?.user?.email])

  // Helper functions
  const joinPoll = (pollId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-poll', pollId)
    }
  }

  const leavePoll = (pollId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-poll', pollId)
    }
  }

  const joinComments = (contentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-comments', contentId)
    }
  }

  const leaveComments = (contentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-comments', contentId)
    }
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  const emit = (event: string, ...args: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinPoll,
    leavePoll,
    joinComments,
    leaveComments,
    on,
    off,
    emit,
  }
}