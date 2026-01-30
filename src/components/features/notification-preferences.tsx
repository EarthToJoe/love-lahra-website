'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

interface UserPreferences {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  commentNotifications: boolean
  newContentNotifications: boolean
  pollNotifications: boolean
  showProfile: boolean
  allowMentions: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({ className = '' }: NotificationPreferencesProps) {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const userId = session?.user?.email || session?.user?.name

  // Fetch user preferences
  useEffect(() => {
    if (!userId) return

    const fetchPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/user/preferences?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) throw new Error('Failed to fetch preferences')
        
        const data = await response.json()
        setPreferences(data.preferences)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [userId])

  // Update a single preference
  const updatePreference = async (field: string, value: boolean) => {
    if (!userId || !preferences) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, field, value })
      })

      if (!response.ok) throw new Error('Failed to update preference')

      const data = await response.json()
      setPreferences(data.preferences)
      setSuccessMessage('Preferences updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preference')
    } finally {
      setSaving(false)
    }
  }

  // Toggle switch component
  const ToggleSwitch = ({ 
    id, 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    id: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean 
  }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="sr-only">Toggle {id}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  if (!session) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">Please sign in to manage your notification preferences.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !preferences) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">Error loading preferences: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!preferences) return null

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Notification Preferences
        </h2>
        <p className="text-gray-600">
          Customize how and when you receive notifications from Lahra's Life.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Notification Settings */}
      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <ToggleSwitch
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onChange={(value) => updatePreference('emailNotifications', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">New Content Notifications</h4>
                <p className="text-sm text-gray-500">Get notified when Lahra posts new content</p>
              </div>
              <ToggleSwitch
                id="newContentNotifications"
                checked={preferences.newContentNotifications}
                onChange={(value) => updatePreference('newContentNotifications', value)}
                disabled={saving || !preferences.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Comment Notifications</h4>
                <p className="text-sm text-gray-500">Get notified about replies and mentions</p>
              </div>
              <ToggleSwitch
                id="commentNotifications"
                checked={preferences.commentNotifications}
                onChange={(value) => updatePreference('commentNotifications', value)}
                disabled={saving || !preferences.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Poll Notifications</h4>
                <p className="text-sm text-gray-500">Get notified about poll results and new polls</p>
              </div>
              <ToggleSwitch
                id="pollNotifications"
                checked={preferences.pollNotifications}
                onChange={(value) => updatePreference('pollNotifications', value)}
                disabled={saving || !preferences.emailNotifications}
              />
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">In-App Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive real-time notifications while browsing</p>
              </div>
              <ToggleSwitch
                id="pushNotifications"
                checked={preferences.pushNotifications}
                onChange={(value) => updatePreference('pushNotifications', value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Show Profile</h4>
                <p className="text-sm text-gray-500">Allow others to see your profile information</p>
              </div>
              <ToggleSwitch
                id="showProfile"
                checked={preferences.showProfile}
                onChange={(value) => updatePreference('showProfile', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Allow Mentions</h4>
                <p className="text-sm text-gray-500">Allow others to mention you in comments</p>
              </div>
              <ToggleSwitch
                id="allowMentions"
                checked={preferences.allowMentions}
                onChange={(value) => updatePreference('allowMentions', value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Status */}
      {saving && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            Saving preferences...
          </div>
        </div>
      )}
    </div>
  )
}