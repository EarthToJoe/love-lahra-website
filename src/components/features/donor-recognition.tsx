'use client'

import { useDonations } from '@/hooks/useDonations'
import { formatAmount } from '@/lib/stripe'
import { ContentSection } from './content-section'

interface DonorRecognitionProps {
  className?: string
  showStats?: boolean
  maxDonors?: number
}

export function DonorRecognition({ 
  className, 
  showStats = true, 
  maxDonors = 10 
}: DonorRecognitionProps) {
  const { donations, stats, loading, error } = useDonations(maxDonors)

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-8 shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-8 shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">⚠️</div>
          <p>Unable to load donor information</p>
        </div>
      </div>
    )
  }

  const publicDonors = donations.filter(d => 
    d.status === 'completed' && 
    !d.donorInfo?.isAnonymous && 
    d.donorInfo?.name
  )

  const anonymousDonorCount = donations.filter(d => 
    d.status === 'completed' && 
    d.donorInfo?.isAnonymous
  ).length

  return (
    <div className={`bg-gradient-to-br from-white to-pink-50 rounded-2xl p-8 shadow-lg border border-pink-100 ${className}`}>
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🙏</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You to Our Supporters!</h3>
        <p className="text-gray-600">
          Your generosity helps keep this digital diary alive and growing
        </p>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {formatAmount(stats.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">Total Raised</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalDonations}
            </div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalDonors + anonymousDonorCount}
            </div>
            <div className="text-sm text-gray-600">Supporters</div>
          </div>
        </div>
      )}

      {/* Recent Donors */}
      {publicDonors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Recent Supporters
          </h4>
          <div className="space-y-4">
            {publicDonors.slice(0, 5).map((donation) => (
              <div key={donation.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {donation.donorInfo?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.donorInfo?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {donation.completedAt && new Date(donation.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {donation.donorInfo?.message && (
                      <p className="text-gray-600 text-sm italic pl-13">
                        "{donation.donorInfo.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-pink-600">
                      {formatAmount(donation.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anonymous Donors */}
      {anonymousDonorCount > 0 && (
        <div className="text-center">
          <p className="text-gray-600">
            Plus {anonymousDonorCount} anonymous supporter{anonymousDonorCount !== 1 ? 's' : ''} 💝
          </p>
        </div>
      )}

      {/* No Donors Yet */}
      {donations.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💝</div>
          <p className="text-gray-600">
            Be the first to support Lahra's content!
          </p>
        </div>
      )}
    </div>
  )
}