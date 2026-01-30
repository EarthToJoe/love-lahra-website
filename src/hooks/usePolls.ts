'use client'

import { useState, useEffect } from 'react'

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
  createdAt: string
  updatedAt: string
  options: PollOption[]
  totalVotes: number
}

interface UsePollsResult {
  polls: Poll[]
  loading: boolean
  error: string | null
  refetch: () => void
  createPoll: (pollData: any) => Promise<Poll | null>
  updatePoll: (pollId: string, updates: any) => Promise<Poll | null>
  deletePoll: (pollId: string) => Promise<boolean>
  vote: (pollId: string, optionId: string, userId: string) => Promise<Poll | null>
  removeVote: (pollId: string, userId: string, optionId?: string) => Promise<boolean>
}

export function usePolls(includeInactive = false): UsePollsResult {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = `/api/polls?includeInactive=${includeInactive}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch polls')
      }
      
      const data = await response.json()
      setPolls(data.polls || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPolls([])
    } finally {
      setLoading(false)
    }
  }

  const createPoll = async (pollData: any): Promise<Poll | null> => {
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create poll')
      }

      const data = await response.json()
      const newPoll = data.poll

      // Add to local state
      setPolls(prev => [newPoll, ...prev])
      
      return newPoll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll')
      return null
    }
  }

  const updatePoll = async (pollId: string, updates: any): Promise<Poll | null> => {
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update poll')
      }

      const data = await response.json()
      const updatedPoll = data.poll

      // Update local state
      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? updatedPoll : poll
      ))
      
      return updatedPoll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poll')
      return null
    }
  }

  const deletePoll = async (pollId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete poll')
      }

      // Remove from local state
      setPolls(prev => prev.filter(poll => poll.id !== pollId))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poll')
      return false
    }
  }

  const vote = async (pollId: string, optionId: string, userId: string): Promise<Poll | null> => {
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId, userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cast vote')
      }

      const data = await response.json()
      const updatedPoll = data.poll

      // Update local state
      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? updatedPoll : poll
      ))
      
      return updatedPoll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote')
      return null
    }
  }

  const removeVote = async (pollId: string, userId: string, optionId?: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({ userId })
      if (optionId) params.append('optionId', optionId)

      const response = await fetch(`/api/polls/${pollId}/vote?${params}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove vote')
      }

      // Refetch to get updated data
      await fetchPolls()
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove vote')
      return false
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [includeInactive])

  return {
    polls,
    loading,
    error,
    refetch: fetchPolls,
    createPoll,
    updatePoll,
    deletePoll,
    vote,
    removeVote
  }
}

// Hook for a single poll
export function usePoll(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPoll = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/polls/${pollId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch poll')
      }
      
      const data = await response.json()
      setPoll(data.poll)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPoll(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pollId) {
      fetchPoll()
    }
  }, [pollId])

  return {
    poll,
    loading,
    error,
    refetch: fetchPoll
  }
}