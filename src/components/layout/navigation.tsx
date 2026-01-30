'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/ui/notification-bell'

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Daily Life', href: '/daily' },
    { name: 'Outfits', href: '/outfits' },
    { name: 'Dining', href: '/dining' },
    { name: 'Fun Facts', href: '/fun-facts' },
    { name: 'Polls', href: '/polls' },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Lahra's Life - Go to homepage">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="ml-2 text-xl font-serif font-semibold text-primary-900">
                Lahra's Life
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="ml-10 flex items-baseline space-x-8" role="menubar">
              {navigationItems.map((item) => (
                <li key={item.name} role="none">
                  <Link
                    href={item.href}
                    className="text-neutral-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-neutral-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <Link
                  href="/profile"
                  className="text-neutral-700 hover:text-primary-600 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                  aria-label={`Profile for ${session.user?.name}`}
                >
                  {session.user?.name}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" aria-label="Sign in to your account">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">{isMobileMenuOpen ? "Close main menu" : "Open main menu"}</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200" role="menu" aria-orientation="vertical" aria-labelledby="mobile-menu-button">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors hover:bg-neutral-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setIsMobileMenuOpen(false)}
                role="menuitem"
                tabIndex={0}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth */}
            <div className="pt-4 pb-3 border-t border-neutral-200" role="group" aria-label="Account actions">
              {session ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="text-neutral-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors hover:bg-neutral-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label={`Profile for ${session.user?.name}`}
                  >
                    Profile ({session.user?.name})
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-neutral-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors hover:bg-neutral-50 rounded-md w-full text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-primary-600 hover:text-primary-700 block px-3 py-2 text-base font-medium transition-colors hover:bg-neutral-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation