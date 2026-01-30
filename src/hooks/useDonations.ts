import { useState, useEffect } from 'react'
import { Donation, DonationStats } from '@/types'

interface UseDonationsReturn {
  donations: Donation[]
  stats: DonationStats | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDonations(limit: number = 10): UseDonationsReturn {
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/donations?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch donations')
      }

      const data = await response.json()
      setDonations(data.donations)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching donations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [limit])

  return {
    donations,
    stats,
    loading,
    error,
    refetch: fetchDonations,
  }
}

// Hook for creating payment intents
export function useCreatePaymentIntent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPaymentIntent = async (
    amount: number,
    donorInfo?: {
      name?: string
      email?: string
      message?: string
      isAnonymous?: boolean
    }
  ) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, donorInfo }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createPaymentIntent,
    loading,
    error,
  }
}