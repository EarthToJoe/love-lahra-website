'use client'

import { useState, useEffect } from 'react'
import { ContentSection } from '@/components/features/content-section'
import { formatAmount } from '@/lib/stripe'

interface DonationRecord {
  id: string
  amount: number
  currency: string
  status: string
  donorInfo: {
    name: string
    email: string
    message: string
    isAnonymous: boolean
  }
  completedAt: string
}

interface DonationGoal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  isActive: boolean
  createdAt: string
}

export default function DonationsAdmin() {
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [goals, setGoals] = useState<DonationGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'donations' | 'goals' | 'analytics'>('donations')
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    isActive: true
  })

  // Mock data for development
  useEffect(() => {
    const mockDonations: DonationRecord[] = [
      {
        id: 'pi_1234567890',
        amount: 2500,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          message: 'Love your content! Keep it up! 💕',
          isAnonymous: false
        },
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 'pi_0987654321',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Anonymous',
          email: 'anonymous@example.com',
          message: 'Thank you for sharing your life with us!',
          isAnonymous: true
        },
        completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      },
      {
        id: 'pi_1122334455',
        amount: 5000,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Michael Chen',
          email: 'michael@example.com',
          message: 'Your style inspiration is amazing!',
          isAnonymous: false
        },
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: 'pi_5566778899',
        amount: 1500,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Emma Wilson',
          email: 'emma@example.com',
          message: 'Thanks for the restaurant recommendations!',
          isAnonymous: false
        },
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      }
    ]

    const mockGoals: DonationGoal[] = [
      {
        id: 'goal_1',
        title: 'Website Hosting & Maintenance',
        description: 'Keep the website running smoothly with reliable hosting and regular updates',
        targetAmount: 10000, // $100
        currentAmount: 6500,  // $65
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'goal_2',
        title: 'New Camera Equipment',
        description: 'Upgrade photography equipment for better outfit and food photos',
        targetAmount: 50000, // $500
        currentAmount: 15000, // $150
        isActive: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'goal_3',
        title: 'Content Creation Tools',
        description: 'Software subscriptions and tools for better content creation',
        targetAmount: 25000, // $250
        currentAmount: 25000, // $250 - completed
        isActive: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    setDonations(mockDonations)
    setGoals(mockGoals)
    setLoading(false)
  }, [])

  const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0)
  const totalDonors = new Set(donations.map(d => d.donorInfo.email)).size
  const averageDonation = donations.length > 0 ? totalRaised / donations.length : 0
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentDonations = donations.filter(d => 
    new Date(d.completedAt) > oneDayAgo
  ).length

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.targetAmount) return

    const goal: DonationGoal = {
      id: `goal_${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      targetAmount: parseInt(newGoal.targetAmount) * 100, // Convert to cents
      currentAmount: 0,
      isActive: newGoal.isActive,
      createdAt: new Date().toISOString()
    }

    setGoals([goal, ...goals])
    setNewGoal({ title: '', description: '', targetAmount: '', isActive: true })
  }

  const toggleGoalStatus = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ContentSection title="Donation Management" className="pt-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">💝 Donation Management</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track donations, manage goals, and engage with your supporters
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(totalRaised)}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donors</p>
                  <p className="text-2xl font-bold text-blue-600">{totalDonors}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Donation</p>
                  <p className="text-2xl font-bold text-purple-600">{formatAmount(averageDonation)}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent (24h)</p>
                  <p className="text-2xl font-bold text-orange-600">{recentDonations}</p>
                  <p className="text-xs text-gray-500">donations</p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('donations')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'donations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Donations</h2>
                <p className="text-sm text-gray-600">All donations received through your website</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                {donation.donorInfo.isAnonymous ? '?' : donation.donorInfo.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {donation.donorInfo.isAnonymous ? 'Anonymous' : donation.donorInfo.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {donation.donorInfo.isAnonymous ? 'Hidden' : donation.donorInfo.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatAmount(donation.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {donation.donorInfo.message || 'No message'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.completedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {donation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {/* Create New Goal */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Goal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., New Camera Equipment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Amount ($)
                    </label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this goal will help you achieve..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newGoal.isActive}
                      onChange={(e) => setNewGoal({ ...newGoal, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active (visible to visitors)
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateGoal}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Goal
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <button
                        onClick={() => toggleGoalStatus(goal.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          goal.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {goal.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>
                          {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% complete
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Created {new Date(goal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Donation Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">$1 - $10</span>
                      <span className="font-medium">
                        {donations.filter(d => d.amount >= 100 && d.amount <= 1000).length} donations
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">$11 - $25</span>
                      <span className="font-medium">
                        {donations.filter(d => d.amount > 1000 && d.amount <= 2500).length} donations
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">$26 - $50</span>
                      <span className="font-medium">
                        {donations.filter(d => d.amount > 2500 && d.amount <= 5000).length} donations
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">$50+</span>
                      <span className="font-medium">
                        {donations.filter(d => d.amount > 5000).length} donations
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Supporters</h3>
                  <div className="space-y-3">
                    {donations
                      .filter(d => !d.donorInfo.isAnonymous)
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 5)
                      .map((donation, index) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {donation.donorInfo.name}
                            </span>
                          </div>
                          <span className="font-medium text-green-600">
                            {formatAmount(donation.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  )
}