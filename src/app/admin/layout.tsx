'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BackHomeButton } from '@/components/ui/back-home-button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAdminAccess() {
      if (status === 'loading') return

      if (!session) {
        router.push('/auth/signin?callbackUrl=/admin')
        return
      }

      try {
        console.log('Checking admin access...')
        // Check admin status via API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch('/api/admin/check-access', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const data = await response.json()
        console.log('Admin check response:', data)
        
        if (data.isAdmin) {
          setIsAuthorized(true)
        } else {
          console.log('Not authorized, redirecting...')
          router.push('/?error=unauthorized')
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
        // If it's a timeout or network error, still try to proceed
        // The API routes will do their own auth check
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Admin check timed out, proceeding anyway')
          setIsAuthorized(true) // Allow through, API will check
        } else {
          router.push('/?error=unauthorized')
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminAccess()
  }, [session, status, router])

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === 'loading' ? 'Loading...' : 'Checking authorization...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Lahra's Life
              </Link>
              <span className="text-sm text-gray-500">Admin Panel</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Welcome, {session?.user?.name || 'Admin'}
              </span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/admin/images" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                📸 Images
              </Link>
              <Link href="/admin/polls" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                🗳️ Polls
              </Link>
              <Link href="/admin/donations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                💝 Donations
              </Link>
              <Link href="/admin/comments" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                💬 Comments
              </Link>
              <BackHomeButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main>
        {children}
      </main>
    </div>
  )
}