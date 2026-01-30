'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { PollWidget } from '@/components/features/poll-widget'
import { CommentSystem } from '@/components/features/comment-system'
import { usePolls } from '@/hooks/usePolls'
import Link from 'next/link'

// Generate a unique visitor ID for this browser session
function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let visitorId = localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('visitor_id', visitorId)
  }
  return visitorId
}

// Get user votes from localStorage
function getUserVotes(pollId: string): string[] {
  if (typeof window === 'undefined') return []
  
  const votesKey = `poll_votes_${pollId}`
  const votes = localStorage.getItem(votesKey)
  return votes ? JSON.parse(votes) : []
}

// Save user vote to localStorage
function saveUserVote(pollId: string, optionId: string) {
  if (typeof window === 'undefined') return
  
  const votesKey = `poll_votes_${pollId}`
  const existingVotes = getUserVotes(pollId)
  
  if (!existingVotes.includes(optionId)) {
    existingVotes.push(optionId)
    localStorage.setItem(votesKey, JSON.stringify(existingVotes))
  }
}

export default function PollsPage() {
  const { polls, loading, error, vote } = usePolls()
  const [visitorId, setVisitorId] = useState<string>('')

  useEffect(() => {
    setVisitorId(getVisitorId())
  }, [])

  const handleVote = async (pollId: string, optionId: string) => {
    if (!visitorId) return

    try {
      const result = await vote(pollId, optionId, visitorId)
      if (result) {
        // Save vote to localStorage for UI state
        saveUserVote(pollId, optionId)
      }
    } catch (error) {
      console.error('Voting error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PageHeader title="Polls" />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PageHeader title="Polls" />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <p className="text-red-600 mb-4">Error loading polls: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="Polls" />
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Polls & Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help me make decisions! Vote on my daily choices, from outfits to restaurants. 
            Your input helps shape my adventures and content.
          </p>
        </div>

        {/* Polls List */}
        {polls.length > 0 ? (
          <div className="space-y-8">
            {polls.map((poll) => (
              <PollWidget
                key={poll.id}
                poll={poll}
                onVote={(optionId) => handleVote(poll.id, optionId)}
                userVotes={getUserVotes(poll.id)}
                showResults={getUserVotes(poll.id).length > 0} // Show results after voting
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🗳️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No active polls</h3>
            <p className="text-gray-500 mb-6">
              Check back soon for new polls and questions!
            </p>
          </div>
        )}

        {/* Call to Action */}
        {polls.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Want to suggest a poll?
              </h3>
              <p className="text-gray-600 mb-4">
                Have an idea for a question I should ask? Let me know!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition-colors">
                  Suggest a Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-16">
          <CommentSystem
            contentId="polls-general"
            contentType="POLL"
            className="bg-white rounded-2xl shadow-lg p-8"
          />
        </div>
      </main>
    </div>
  )
}