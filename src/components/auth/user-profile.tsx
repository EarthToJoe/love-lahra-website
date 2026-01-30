'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NotificationPreferences } from '@/components/features/notification-preferences'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function UserProfile() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: session?.user?.name || '',
      email: session?.user?.email || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // In a real app, you'd call an API to update the user profile
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.displayName,
          email: data.email,
        },
      })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset({
      displayName: session?.user?.name || '',
      email: session?.user?.email || '',
    })
    setIsEditing(false)
    setMessage(null)
  }

  if (!session) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-luxury overflow-hidden">
        {/* Header */}
        <div className="text-center p-8 border-b border-gray-200">
          <h1 className="font-display text-3xl font-bold text-primary-500 mb-2">
            Your Profile
          </h1>
          <p className="text-neutral-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notification Preferences
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'profile' ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    {...register('displayName')}
                    disabled={!isEditing}
                    className={errors.displayName ? 'border-red-500' : ''}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-600">{errors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="px-3 py-2 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                    {session.user.role === 'ADMIN' ? 'Administrator' : 
                     session.user.role === 'MODERATOR' ? 'Moderator' : 'Member'}
                  </div>
                </div>

                {message && (
                  <div className={`rounded-lg p-3 ${
                    message.type === 'success' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm ${
                      message.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isEditing ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex-1"
                      >
                        Edit Profile
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => signOut()}
                        className="flex-1"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <NotificationPreferences />
          )}
        </div>
      </div>
    </div>
  )
}