'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useImages } from '@/hooks/useImages'
import { usePolls } from '@/hooks/usePolls'
import { ContentSection } from '@/components/features/content-section'
import { formatAmount } from '@/lib/stripe'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { images: allImages, loading: imagesLoading } = useImages()
  const { polls, loading: pollsLoading } = usePolls()
  const [commentStats, setCommentStats] = useState({ total: 0, recent: 0 })
  const [donationStats, setDonationStats] = useState({ total: 0, amount: 0, recent: 0 })

  // Fetch comment statistics
  useEffect(() => {
    const fetchCommentStats = async () => {
      try {
        // This would normally fetch from multiple content types
        const responses = await Promise.all([
          fetch('/api/comments?contentId=outfits-general&contentType=CONTENT_SECTION'),
          fetch('/api/comments?contentId=polls-general&contentType=POLL'),
          fetch('/api/comments?contentId=dining-general&contentType=CONTENT_SECTION'),
          fetch('/api/comments?contentId=daily-general&contentType=CONTENT_SECTION'),
          fetch('/api/comments?contentId=this-or-that-general&contentType=GENERAL'),
        ])
        
        const commentData = await Promise.all(responses.map(r => r.json()))
        const totalComments = commentData.reduce((sum, data) => sum + (data.comments?.length || 0), 0)
        
        // Count recent comments (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const recentComments = commentData.reduce((sum, data) => {
          const recent = data.comments?.filter((comment: any) => 
            new Date(comment.createdAt) > oneDayAgo
          ).length || 0
          return sum + recent
        }, 0)
        
        setCommentStats({ total: totalComments, recent: recentComments })
      } catch (error) {
        console.error('Error fetching comment stats:', error)
      }
    }

    fetchCommentStats()
  }, [])

  // Fetch donation statistics (mock data for now)
  useEffect(() => {
    const fetchDonationStats = async () => {
      try {
        // Mock donation data - in production this would fetch from /api/donations
        const mockDonations = [
          { amount: 2500, completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { amount: 1000, completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
          { amount: 5000, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          { amount: 1500, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ]
        
        const totalAmount = mockDonations.reduce((sum, donation) => sum + donation.amount, 0)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const recentDonations = mockDonations.filter(d => 
          new Date(d.completedAt) > oneDayAgo
        ).length
        
        setDonationStats({ 
          total: mockDonations.length, 
          amount: totalAmount, 
          recent: recentDonations 
        })
      } catch (error) {
        console.error('Error fetching donation stats:', error)
      }
    }

    fetchDonationStats()
  }, [])
  
  const stats = {
    totalPhotos: allImages.length,
    outfits: allImages.filter(img => img.category === 'outfits').length,
    dining: allImages.filter(img => img.category === 'dining').length,
    daily: allImages.filter(img => img.category === 'daily').length,
    snacks: allImages.filter(img => img.category === 'snacks').length,
    polls: polls.length,
    activePolls: polls.filter(poll => poll.isActive).length,
    comments: commentStats.total,
    recentComments: commentStats.recent,
    donations: donationStats.total,
    donationAmount: donationStats.amount,
    recentDonations: donationStats.recent,
  }

  const adminSections = [
    {
      title: 'Photo Management',
      description: 'Upload, organize, and manage all photos across categories',
      icon: '📸',
      href: '/admin/images',
      stats: `${stats.totalPhotos} photos`,
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      title: 'Polls & Voting',
      description: 'Create polls, manage voting, and engage with your audience',
      icon: '🗳️',
      href: '/admin/polls',
      stats: `${stats.polls} polls (${stats.activePolls} active)`,
      color: 'from-indigo-500 to-indigo-600',
      available: true
    },
    {
      title: 'This or That',
      description: 'Manage visual vibe-based questions and aesthetic choices',
      icon: '🤔',
      href: '/admin/this-or-that',
      stats: 'Visual voting',
      color: 'from-violet-500 to-violet-600',
      available: true
    },
    {
      title: 'Restaurant Reviews',
      description: 'Add dining experiences, restaurant reviews, and food photos',
      icon: '🍽️',
      href: '/admin/dining',
      stats: `${stats.dining} restaurants`,
      color: 'from-amber-500 to-amber-600',
      available: true
    },
    {
      title: 'Daily Content',
      description: 'Add daily activities, moments, and life updates',
      icon: '✨',
      href: '/admin/daily',
      stats: `${stats.daily} posts`,
      color: 'from-pink-500 to-pink-600',
      available: true
    },
    {
      title: 'Style & Outfits',
      description: 'Manage outfit posts, style inspiration, and fashion content',
      icon: '👗',
      href: '/admin/outfits',
      stats: `${stats.outfits} outfits`,
      color: 'from-purple-500 to-purple-600',
      available: true
    },
    {
      title: 'Snacks & Treats',
      description: 'Share your favorite snacks, treats, and food discoveries',
      icon: '🍿',
      href: '/admin/snacks',
      stats: 'Snack posts',
      color: 'from-orange-500 to-orange-600',
      available: true
    },
    {
      title: 'Fun Facts',
      description: 'Add interesting facts, trivia, and personal tidbits',
      icon: '🤓',
      href: '/admin/fun-facts',
      stats: 'Fun facts',
      color: 'from-teal-500 to-teal-600',
      available: true
    },
    {
      title: 'Watchlist',
      description: 'Manage your movie and TV show watchlist',
      icon: '🎬',
      href: '/admin/watchlist',
      stats: 'Watchlist items',
      color: 'from-red-500 to-red-600',
      available: true
    },
    {
      title: 'Donation Management',
      description: 'Track donations, manage goals, and engage with supporters',
      icon: '💝',
      href: '/admin/donations',
      stats: `${stats.donations} donations ($${(stats.donationAmount / 100).toFixed(0)} raised)`,
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      title: 'Comment Moderation',
      description: 'Review comments, handle flags, and moderate discussions',
      icon: '💬',
      href: '/admin/comments',
      stats: `${stats.comments} comments (${stats.recentComments} recent)`,
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      title: 'Website Settings',
      description: 'Customize themes, colors, layout, and site preferences',
      icon: '⚙️',
      href: '/admin/settings',
      stats: 'Customize',
      color: 'from-gray-500 to-gray-600',
      available: true
    }
  ]

  const isLoading = imagesLoading || pollsLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ContentSection title="Admin Dashboard" className="pt-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {session?.user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your content, upload photos, create posts, and customize your website. 
              Everything you need to keep your digital diary up to date.
            </p>
          </div>

          {/* Quick Stats */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Photos</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</p>
                  </div>
                  <div className="text-3xl">📸</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Polls</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.activePolls}</p>
                    <p className="text-xs text-gray-500">{stats.polls} total</p>
                  </div>
                  <div className="text-3xl">🗳️</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Comments</p>
                    <p className="text-2xl font-bold text-green-600">{stats.comments}</p>
                    <p className="text-xs text-gray-500">{stats.recentComments} recent</p>
                  </div>
                  <div className="text-3xl">💬</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Donations</p>
                    <p className="text-2xl font-bold text-green-600">{stats.donations}</p>
                    <p className="text-xs text-gray-500">{stats.recentDonations} recent</p>
                  </div>
                  <div className="text-3xl">💝</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Raised</p>
                    <p className="text-2xl font-bold text-purple-600">${(stats.donationAmount / 100).toFixed(0)}</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminSections.map((section, index) => (
              <div key={index} className="relative">
                {section.available ? (
                  <Link href={section.href} className="group block">
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group-hover:scale-105">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} text-white text-2xl mb-6 shadow-lg`}>
                        {section.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{section.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">{section.description}</p>
                      <div className="text-sm text-blue-600 font-medium">{section.stats}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-white/50 rounded-2xl p-8 shadow-lg border border-gray-200 relative">
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} opacity-50 text-white text-2xl mb-6 shadow-lg`}>
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-500 mb-3">{section.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-4">{section.description}</p>
                    <div className="text-sm text-gray-400 font-medium">{section.stats}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admin/images" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                📸 Upload Photos
              </Link>
              <Link href="/admin/polls" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                🗳️ Create Poll
              </Link>
              <Link href="/admin/this-or-that" className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors">
                🤔 Add This or That
              </Link>
              <Link href="/admin/dining" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors">
                🍽️ Add Restaurant
              </Link>
              <Link href="/admin/donations" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                💝 Manage Donations
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {stats.recentDonations > 0 && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl">💝</div>
                  <div>
                    <p className="font-medium text-gray-900">{stats.recentDonations} new donations</p>
                    <p className="text-sm text-gray-600">Donations received in the last 24 hours</p>
                  </div>
                </div>
              )}

              {stats.recentComments > 0 && (
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl">💬</div>
                  <div>
                    <p className="font-medium text-gray-900">{stats.recentComments} new comments</p>
                    <p className="text-sm text-gray-600">Comments posted in the last 24 hours</p>
                  </div>
                </div>
              )}
              
              {stats.activePolls > 0 && (
                <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl">🗳️</div>
                  <div>
                    <p className="font-medium text-gray-900">{stats.activePolls} active polls</p>
                    <p className="text-sm text-gray-600">Polls currently accepting votes</p>
                  </div>
                </div>
              )}
              
              {stats.totalPhotos > 0 && (
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl">📸</div>
                  <div>
                    <p className="font-medium text-gray-900">{stats.totalPhotos} photos uploaded</p>
                    <p className="text-sm text-gray-600">Total photos across all categories</p>
                  </div>
                </div>
              )}
              
              {stats.totalPhotos === 0 && stats.activePolls === 0 && stats.recentComments === 0 && stats.recentDonations === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🌟</div>
                  <p>No recent activity. Start by uploading some photos or creating a poll!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  )
}