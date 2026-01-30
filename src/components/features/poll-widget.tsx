'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSocket } from '@/hooks/useSocket'

interface PollOption {
  id: string
  text: string
  image?: string
  order: number
  voteCount: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  description?: string
  questionImage?: string // Added question image support
  allowMultipleVotes: boolean
  isActive: boolean
  expiresAt?: string
  totalVotes: number
  options: PollOption[]
}

interface PollWidgetProps {
  poll: Poll
  onVote: (optionId: string) => void
  userVotes?: string[] // Array of option IDs the user has voted for
  showResults?: boolean
  className?: string
}

export function PollWidget({ 
  poll: initialPoll, 
  onVote, 
  userVotes = [], 
  showResults = false,
  className = '' 
}: PollWidgetProps) {
  const [poll, setPoll] = useState(initialPoll)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const { isConnected, joinPoll, leavePoll, on, off } = useSocket()

  // Join poll room for real-time updates
  useEffect(() => {
    if (isConnected) {
      joinPoll(poll.id)
    }

    return () => {
      if (isConnected) {
        leavePoll(poll.id)
      }
    }
  }, [isConnected, poll.id, joinPoll, leavePoll])

  // Listen for real-time poll updates
  useEffect(() => {
    const handlePollUpdate = (data: { pollId: string; results: any }) => {
      if (data.pollId === poll.id) {
        setPoll(prevPoll => ({
          ...prevPoll,
          options: data.results.options,
          totalVotes: data.results.totalVotes
        }))
      }
    }

    on('poll-update', handlePollUpdate)

    return () => {
      off('poll-update', handlePollUpdate)
    }
  }, [poll.id, on, off])

  const hasVoted = userVotes.length > 0
  const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false
  const canVote = poll.isActive && !isExpired && !hasVoted // Only allow one vote per visitor

  const handleVote = async (optionId: string) => {
    if (!canVote || isVoting) return

    setIsVoting(true)
    try {
      await onVote(optionId)
    } finally {
      setIsVoting(false)
      setSelectedOption(null)
    }
  }

  const getOptionButtonClass = (option: PollOption) => {
    const hasImage = !!option.image
    const baseClass = hasImage 
      ? "relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden"
      : "relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left"
    
    if (!canVote) {
      return `${baseClass} border-gray-200 bg-gray-50 cursor-not-allowed`
    }

    if (userVotes.includes(option.id)) {
      return `${baseClass} border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-200`
    }

    if (selectedOption === option.id) {
      return `${baseClass} border-blue-400 bg-blue-25 shadow-lg scale-105`
    }

    return `${baseClass} border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-25 hover:shadow-md cursor-pointer ${hasImage ? 'hover:scale-102' : ''}`
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Real-time connection indicator */}
      {isConnected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Question Image */}
      {poll.questionImage && (
        <div className="relative w-full h-48 md:h-64">
          <Image
            src={poll.questionImage}
            alt={poll.question}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
      )}

      {/* Poll Content */}
      <div className="p-6">
        {/* Poll Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {poll.question}
          </h3>
          {poll.description && (
            <p className="text-gray-600 text-sm">
              {poll.description}
            </p>
          )}
          
          {/* Poll Status */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
              {hasVoted && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  You voted!
                </span>
              )}
              {isConnected && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              )}
            </div>
            
            {isExpired && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                Expired
              </span>
            )}
            
            {!poll.isActive && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Poll Options */}
        <div className="space-y-3">
          {poll.options.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: option.order * 0.1 }}
            >
              <button
                onClick={() => canVote ? handleVote(option.id) : undefined}
                className={getOptionButtonClass(option)}
                disabled={!canVote || isVoting}
              >
                <div className="flex items-center space-x-4">
                  {/* Option Image */}
                  {option.image && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={option.image}
                        alt={option.text}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  
                  {/* Option Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">
                        {option.text}
                      </span>
                      
                      {/* Vote Count/Percentage */}
                      {(showResults || hasVoted) && (
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-sm font-medium text-gray-700">
                            {option.percentage}%
                          </span>
                          <span className="text-xs text-gray-500">
                            ({option.voteCount})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {(showResults || hasVoted) && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-blue-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${option.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Vote Indicator */}
                  {userVotes.includes(option.id) && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading Overlay */}
                {isVoting && selectedOption === option.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Poll Footer */}
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-green-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Thanks for voting! Here are the current results.
              </span>
            </div>
          </motion.div>
        )}

        {/* Expiration Notice */}
        {poll.expiresAt && !isExpired && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Poll expires on {new Date(poll.expiresAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}