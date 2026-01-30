'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { CommentSystem } from '@/components/features/comment-system'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Generate a unique visitor ID for this browser session
function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let visitorId = localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem('visitor_id', visitorId)
  }
  return visitorId
}

// Get user votes from localStorage
function getUserVote(questionId: string): string | null {
  if (typeof window === 'undefined') return null
  
  const voteKey = `thisorthat_${questionId}`
  return localStorage.getItem(voteKey)
}

// Save user vote to localStorage
function saveUserVote(questionId: string, choice: string) {
  if (typeof window === 'undefined') return
  
  const voteKey = `thisorthat_${questionId}`
  localStorage.setItem(voteKey, choice)
}

interface ThisOrThatQuestion {
  id: string
  title: string
  optionA: {
    image: string
    label: string
    votes: number
  }
  optionB: {
    image: string
    label: string
    votes: number
  }
  totalVotes: number
  createdAt: string
  isActive: boolean
}

export default function ThisOrThatPage() {
  const [questions, setQuestions] = useState<ThisOrThatQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visitorId, setVisitorId] = useState<string>('')

  useEffect(() => {
    setVisitorId(getVisitorId())
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/this-or-that')
      if (!response.ok) throw new Error('Failed to fetch questions')
      
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (questionId: string, choice: 'A' | 'B') => {
    if (!visitorId) return

    try {
      const response = await fetch(`/api/this-or-that/${questionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice, visitorId })
      })

      if (!response.ok) throw new Error('Failed to vote')
      
      const data = await response.json()
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? data.question : q
      ))
      
      // Save vote locally
      saveUserVote(questionId, choice)
    } catch (error) {
      console.error('Voting error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PageHeader title="This or That" />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PageHeader title="This or That" />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
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
      <PageHeader title="This or That" />
      
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            This or That?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quick vibe checks! Choose between two beautiful options. 
            It's all about feeling and aesthetic - go with your gut! ✨
          </p>
        </div>

        {/* Questions */}
        {questions.length > 0 ? (
          <div className="space-y-12">
            {questions.map((question, index) => {
              const userVote = getUserVote(question.id)
              const hasVoted = !!userVote
              const percentageA = question.totalVotes > 0 ? Math.round((question.optionA.votes / question.totalVotes) * 100) : 0
              const percentageB = question.totalVotes > 0 ? Math.round((question.optionB.votes / question.totalVotes) * 100) : 0

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                  {/* Question Title */}
                  <div className="p-8 pb-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {question.title}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {question.totalVotes} vote{question.totalVotes !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Options Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Option A */}
                    <div className="relative group">
                      <button
                        onClick={() => !hasVoted ? handleVote(question.id, 'A') : undefined}
                        disabled={hasVoted}
                        className={`relative w-full h-80 md:h-96 overflow-hidden transition-all duration-300 ${
                          hasVoted 
                            ? 'cursor-default' 
                            : 'cursor-pointer hover:scale-105 transform'
                        } ${
                          userVote === 'A' ? 'ring-4 ring-blue-500' : ''
                        }`}
                      >
                        <Image
                          src={question.optionA.image}
                          alt={question.optionA.label}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                          hasVoted ? 'bg-opacity-20' : 'bg-opacity-0 group-hover:bg-opacity-10'
                        }`} />
                        
                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                          <h3 className="text-white text-xl font-semibold mb-2">
                            {question.optionA.label}
                          </h3>
                          
                          {hasVoted && (
                            <div className="flex items-center justify-between">
                              <span className="text-white text-lg font-bold">
                                {percentageA}%
                              </span>
                              <span className="text-white/80 text-sm">
                                {question.optionA.votes} votes
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Vote Indicator */}
                        {userVote === 'A' && (
                          <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>

                    {/* VS Divider */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-gray-100 md:block hidden">
                      <span className="text-gray-600 font-bold text-lg">VS</span>
                    </div>

                    {/* Option B */}
                    <div className="relative group">
                      <button
                        onClick={() => !hasVoted ? handleVote(question.id, 'B') : undefined}
                        disabled={hasVoted}
                        className={`relative w-full h-80 md:h-96 overflow-hidden transition-all duration-300 ${
                          hasVoted 
                            ? 'cursor-default' 
                            : 'cursor-pointer hover:scale-105 transform'
                        } ${
                          userVote === 'B' ? 'ring-4 ring-blue-500' : ''
                        }`}
                      >
                        <Image
                          src={question.optionB.image}
                          alt={question.optionB.label}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                          hasVoted ? 'bg-opacity-20' : 'bg-opacity-0 group-hover:bg-opacity-10'
                        }`} />
                        
                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                          <h3 className="text-white text-xl font-semibold mb-2">
                            {question.optionB.label}
                          </h3>
                          
                          {hasVoted && (
                            <div className="flex items-center justify-between">
                              <span className="text-white text-lg font-bold">
                                {percentageB}%
                              </span>
                              <span className="text-white/80 text-sm">
                                {question.optionB.votes} votes
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Vote Indicator */}
                        {userVote === 'B' && (
                          <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Results Bar (only show after voting) */}
                  {hasVoted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{question.optionA.label}</span>
                            <span>{percentageA}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-blue-600 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentageA}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{question.optionB.label}</span>
                            <span>{percentageB}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-purple-600 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentageB}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <p className="text-green-600 font-medium text-sm">
                          ✨ Thanks for voting! You chose {userVote === 'A' ? question.optionA.label : question.optionB.label}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🤔</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-6">
              Check back soon for new "This or That" questions!
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <CommentSystem
            contentId="this-or-that-general"
            contentType="GENERAL"
            className="bg-white rounded-2xl shadow-lg p-8"
          />
        </div>
      </main>
    </div>
  )
}