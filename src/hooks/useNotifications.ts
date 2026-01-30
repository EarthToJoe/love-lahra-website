'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from './useSocket'

interface Notification {
  id: string
  userId: string
  type: 'NEW_CONTENT' | 'COMMENT_REPLY' | 'COMMENT_MENTION' | 'POLL_RESULT' | 'DONATION_RECEIVED' | 'SYSTEM'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

interface UseNotificationsOptions {
  autoFetch?: boolean
  limit?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoFetch = true, limit = 20 } = options
  const { data: session } = useSession()
  const { isConnected, on, off } = useSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.email || session?.user?.name

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        userId,
        limit: limit.toString(),
        ...(unreadOnly && { unreadOnly: 'true' })
      })

      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')

      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds?: string[], markAll = false) => {
    if (!userId) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notificationIds,
          markAllAsRead: markAll
        })
      })

      if (!response.ok) throw new Error('Failed to mark notifications as read')

      // Update local state
      setNotifications(prev => prev.map(notif => {
        if (markAll || (notificationIds && notificationIds.includes(notif.id))) {
          return { ...notif, isRead: true }
        }
        return notif
      }))

      // Update unread count
      if (markAll) {
        setUnreadCount(0)
      } else if (notificationIds) {
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read')
    }
  }, [userId])

  // Mark single notification as read
  const markOneAsRead = useCallback((notificationId: string) => {
    markAsRead([notificationId])
  }, [markAsRead])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    markAsRead(undefined, true)
  }, [markAsRead])

  // Auto-fetch notifications when component mounts
  useEffect(() => {
    if (autoFetch && userId) {
      fetchNotifications()
    }
  }, [autoFetch, userId, fetchNotifications])

  // Listen for real-time notifications
  useEffect(() => {
    if (!isConnected || !userId) return

    const handleNewNotification = (notification: Notification) => {
      if (notification.userId === userId) {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    }

    on('new-notification', handleNewNotification)

    return () => {
      off('new-notification', handleNewNotification)
    }
  }, [isConnected, userId, on, off])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markOneAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}