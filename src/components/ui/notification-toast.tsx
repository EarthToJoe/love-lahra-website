'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import { useSession } from 'next-auth/react'

interface ToastNotification {
  id: string
  type: 'NEW_CONTENT' | 'COMMENT_REPLY' | 'COMMENT_MENTION' | 'POLL_RESULT' | 'DONATION_RECEIVED' | 'SYSTEM'
  title: string
  message: string
  timestamp: number
}

interface NotificationToastProps {
  duration?: number // Duration in milliseconds
  maxToasts?: number // Maximum number of toasts to show at once
}

export function NotificationToast({ duration = 5000, maxToasts = 3 }: NotificationToastProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const { data: session } = useSession()
  const { isConnected, on, off } = useSocket()

  const userId = session?.user?.email || session?.user?.name

  // Listen for real-time notifications
  useEffect(() => {
    if (!isConnected || !userId) return

    const handleNewNotification = (notification: any) => {
      if (notification.userId === userId) {
        const toast: ToastNotification = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: Date.now()
        }

        setToasts(prev => {
          const newToasts = [toast, ...prev].slice(0, maxToasts)
          return newToasts
        })

        // Auto-remove toast after duration
        setTimeout(() => {
          removeToast(toast.id)
        }, duration)
      }
    }

    on('new-notification', handleNewNotification)

    return () => {
      off('new-notification', handleNewNotification)
    }
  }, [isConnected, userId, duration, maxToasts, on, off])

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId))
  }

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'NEW_CONTENT':
        return '📝'
      case 'COMMENT_REPLY':
        return '💬'
      case 'COMMENT_MENTION':
        return '👋'
      case 'POLL_RESULT':
        return '📊'
      case 'DONATION_RECEIVED':
        return '💝'
      default:
        return '🔔'
    }
  }

  const getToastColor = (type: string) => {
    switch (type) {
      case 'NEW_CONTENT':
        return 'bg-blue-500'
      case 'COMMENT_REPLY':
        return 'bg-green-500'
      case 'COMMENT_MENTION':
        return 'bg-purple-500'
      case 'POLL_RESULT':
        return 'bg-orange-500'
      case 'DONATION_RECEIVED':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm w-full"
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getToastColor(toast.type)} flex items-center justify-center text-white text-sm`}>
                {getToastIcon(toast.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {toast.title}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <motion.div
              className={`mt-3 h-1 ${getToastColor(toast.type)} rounded-full`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}