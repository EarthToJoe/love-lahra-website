'use client'

import { useDonations } from '@/hooks/useDonations'
import { formatAmount } from '@/lib/stripe'

interface DonationGoal {
  id: string
  title: string
  description: string
  targetAmount: number
  icon: string
  color: string
  isActive: boolean
}

const mockGoals: DonationGoal[] = [
  {
    id: 'hosting',
    title: 'Website Hosting',
    description: 'Keep the lights on and the site running smoothly',
    targetAmount: 5000, // $50
    icon: '🌐',
    color: 'from-blue-500 to-blue-600',
    isActive: true,
  },
  {
    id: 'camera',
    title: 'New Camera Equipment',
    description: 'Upgrade photography gear for better outfit and food photos',
    targetAmount: 50000, // $500
    icon: '📷',
    color: 'from-purple-500 to-purple-600',
    isActive: true,
  },
  {
    id: 'content',
    title: 'Content Creation Fund',
    description: 'Support for creating more engaging content and experiences',
    targetAmount: 25000, // $250
    icon: '✨',
    color: 'from-pink-500 to-pink-600',
    isActive: true,
  },
]

interface DonationGoalsProps {
  className?: string
}

export function DonationGoals({ className }: DonationGoalsProps) {
  const { stats, loading, error } = useDonations()

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-8 shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <p>Unable to load donation goals</p>
        </div>
      </div>
    )
  }

  const totalRaised = stats?.totalAmount || 0
  const activeGoals = mockGoals.filter(goal => goal.isActive)

  return (
    <div className={`bg-white rounded-2xl p-8 shadow-lg ${className}`}>
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Donation Goals</h3>
        <p className="text-gray-600">
          Help us reach these milestones to improve the site and content!
        </p>
      </div>

      <div className="space-y-6">
        {activeGoals.map((goal) => {
          const progress = Math.min((totalRaised / goal.targetAmount) * 100, 100)
          const isCompleted = totalRaised >= goal.targetAmount
          
          return (
            <div key={goal.id} className="relative">
              <div className="flex items-start space-x-4 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                    {isCompleted && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        ✅ Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${goal.color} transition-all duration-500 ease-out`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-gray-600">
                        {formatAmount(Math.min(totalRaised, goal.targetAmount))} raised
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatAmount(goal.targetAmount)} goal
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Percentage */}
                  <div className="mt-2 text-right">
                    <span className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                      {progress.toFixed(0)}% complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Total Progress
          </div>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {formatAmount(totalRaised)}
          </div>
          <div className="text-sm text-gray-600">
            of {formatAmount(activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))} total goals
          </div>
        </div>
      </div>
    </div>
  )
}