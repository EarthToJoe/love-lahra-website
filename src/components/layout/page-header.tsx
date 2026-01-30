'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { BackHomeButton } from '@/components/ui/back-home-button'

interface PageHeaderProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  backHref = '/', 
  backLabel = 'Home' 
}: PageHeaderProps) {
  const { data: session } = useSession()

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Back Button */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent font-dancing">
              Lahra's Life
            </Link>
            
            {showBackButton && (
              <div className="flex items-center space-x-2 text-gray-500">
                <span>/</span>
                <BackHomeButton className="text-primary-600 hover:text-primary-800 font-medium transition-colors flex items-center space-x-1" />
                {title && (
                  <>
                    <span>/</span>
                    <span className="text-gray-700 font-medium">{title}</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Center - Main Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link href="/daily" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">My Day</Link>
            <Link href="/outfits" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Style</Link>
            <Link href="/dining" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Dining</Link>
            <Link href="/snacks" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Snacks</Link>
            <Link href="/fun-facts" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Fun Facts</Link>
          </div>

          {/* Right side - User Menu */}
          <div>
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {session.user?.name}
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin">
                <button className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}