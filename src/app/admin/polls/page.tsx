'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { PollCreator } from '@/components/features/poll-creator'
import { PollWidget } from '@/components/features/poll-widget'
import { usePolls } from '@/hooks/usePolls'
import { Button } from '@/components/ui/button'

export default function AdminPollsPage() {
  const { polls, loading, error, createPoll, updatePoll, deletePoll } = usePolls(true) // Include inactive polls
  const [showCreator, setShowCreator] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const handleCreatePoll = async (pollData: any) => {
    const newPoll = await createPoll(pollData)
    if (newPoll) {
      setShowCreator(false)
    }
  }

  const handleToggleActive = async (pollId: string, isActive: boolean) => {
    await updatePoll(pollId, { isActive: !isActive })
  }

  const handleDeletePoll = async (pollId: string) => {
    if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      await deletePoll(pollId)
    }
  }

  const filteredPolls = polls.filter(poll => {
    if (filter === 'active') return poll.isActive
    if (filter === 'inactive') return !poll.isActive
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PageHeader title="Poll Management" backHref="/admin" backLabel="Admin" />
        <div className="max-w-6xl mx-auto py-12 px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="Poll Management" backHref="/admin" backLabel="Admin" />
      
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Poll Management</h1>
            <p className="text-gray-600 mt-2">Create and manage polls for your audience</p>
          </div>
          
          <Button
            onClick={() => setShowCreator(!showCreator)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showCreator ? 'Cancel' : 'Create New Poll'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Poll Creator */}
        {showCreator && (
          <div className="mb-8">
            <PollCreator
              onCreatePoll={handleCreatePoll}
              onCancel={() => setShowCreator(false)}
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Polls', count: polls.length },
            { key: 'active', label: 'Active', count: polls.filter(p => p.isActive).length },
            { key: 'inactive', label: 'Inactive', count: polls.filter(p => !p.isActive).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Polls List */}
        {filteredPolls.length > 0 ? (
          <div className="space-y-6">
            {filteredPolls.map((poll) => (
              <div key={poll.id} className="relative">
                {/* Admin Controls */}
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                  <button
                    onClick={() => handleToggleActive(poll.id, poll.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      poll.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {poll.isActive ? 'Active' : 'Inactive'}
                  </button>
                  
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>

                {/* Poll Widget */}
                <PollWidget
                  poll={poll}
                  onVote={() => {}} // Admin doesn't vote
                  userVotes={[]}
                  showResults={true}
                  className={!poll.isActive ? 'opacity-60' : ''}
                />

                {/* Poll Stats */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 font-medium">
                        {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Votes:</span>
                      <span className="ml-2 font-medium">{poll.totalVotes}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 font-medium ${
                        poll.isActive ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {poll.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <span className="ml-2 font-medium">
                        {poll.expiresAt 
                          ? new Date(poll.expiresAt).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🗳️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {filter === 'all' ? 'No polls yet' : `No ${filter} polls`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Create your first poll to start engaging with your audience!'
                : `Switch to a different filter to see other polls.`
              }
            </p>
            {filter === 'all' && (
              <Button
                onClick={() => setShowCreator(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Poll
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}