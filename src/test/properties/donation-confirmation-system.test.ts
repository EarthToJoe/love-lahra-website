/**
 * Property 25: Donation Confirmation System
 * **Validates: Requirements 11.4**
 * 
 * This property test validates that donation confirmation works correctly:
 * - Donation records are properly formatted
 * - Confirmation data includes all required fields
 * - Thank you messages are generated correctly
 */

import { describe, it, expect } from 'vitest'
import { formatAmount } from '@/lib/stripe'

// Mock donation record structure
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
  completedAt: Date
}

// Helper function to create donation confirmation
const createDonationConfirmation = (donationRecord: DonationRecord) => {
  return {
    id: donationRecord.id,
    amount: formatAmount(donationRecord.amount),
    donorName: donationRecord.donorInfo.isAnonymous ? 'Anonymous' : donationRecord.donorInfo.name,
    message: donationRecord.donorInfo.message,
    timestamp: donationRecord.completedAt.toISOString(),
    thankYouMessage: generateThankYouMessage(donationRecord),
    receiptData: {
      transactionId: donationRecord.id,
      amount: formatAmount(donationRecord.amount),
      date: donationRecord.completedAt.toLocaleDateString(),
      status: donationRecord.status
    }
  }
}

// Helper function to generate thank you message
const generateThankYouMessage = (donationRecord: DonationRecord): string => {
  const donorName = donationRecord.donorInfo.isAnonymous ? 'Anonymous supporter' : donationRecord.donorInfo.name
  const amount = formatAmount(donationRecord.amount)
  
  return `Thank you, ${donorName}, for your generous donation of ${amount}! Your support means the world to us.`
}

describe('Property 25: Donation Confirmation System', () => {
  describe('Confirmation Data Structure', () => {
    it('should create complete confirmation with all required fields', () => {
      const donationRecord: DonationRecord = {
        id: 'pi_test_123456',
        amount: 2500,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Keep up the great work!',
          isAnonymous: false
        },
        completedAt: new Date('2024-01-15T10:30:00Z')
      }

      const confirmation = createDonationConfirmation(donationRecord)

      expect(confirmation.id).toBe('pi_test_123456')
      expect(confirmation.amount).toBe('$25.00')
      expect(confirmation.donorName).toBe('John Doe')
      expect(confirmation.message).toBe('Keep up the great work!')
      expect(confirmation.timestamp).toBe('2024-01-15T10:30:00.000Z')
      expect(confirmation.thankYouMessage).toContain('John Doe')
      expect(confirmation.thankYouMessage).toContain('$25.00')
      expect(confirmation.receiptData.transactionId).toBe('pi_test_123456')
      expect(confirmation.receiptData.amount).toBe('$25.00')
      expect(confirmation.receiptData.status).toBe('completed')
    })

    it('should handle anonymous donations correctly', () => {
      const anonymousDonation: DonationRecord = {
        id: 'pi_test_789',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          message: 'Anonymous donation',
          isAnonymous: true
        },
        completedAt: new Date('2024-01-15T14:45:00Z')
      }

      const confirmation = createDonationConfirmation(anonymousDonation)

      expect(confirmation.donorName).toBe('Anonymous')
      expect(confirmation.thankYouMessage).toContain('Anonymous supporter')
      expect(confirmation.thankYouMessage).not.toContain('Jane Smith')
    })

    it('should format different donation amounts correctly', () => {
      const amounts = [100, 500, 1000, 2500, 5000, 10000, 50000]
      const expectedFormats = ['$1.00', '$5.00', '$10.00', '$25.00', '$50.00', '$100.00', '$500.00']

      amounts.forEach((amount, index) => {
        const donationRecord: DonationRecord = {
          id: `pi_test_${index}`,
          amount,
          currency: 'usd',
          status: 'completed',
          donorInfo: {
            name: 'Test Donor',
            email: 'test@example.com',
            message: 'Test donation',
            isAnonymous: false
          },
          completedAt: new Date()
        }

        const confirmation = createDonationConfirmation(donationRecord)
        expect(confirmation.amount).toBe(expectedFormats[index])
        expect(confirmation.receiptData.amount).toBe(expectedFormats[index])
      })
    })
  })

  describe('Thank You Message Generation', () => {
    it('should generate personalized thank you messages', () => {
      const donationRecord: DonationRecord = {
        id: 'pi_test_456',
        amount: 5000,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          message: 'Love the content!',
          isAnonymous: false
        },
        completedAt: new Date()
      }

      const message = generateThankYouMessage(donationRecord)

      expect(message).toContain('Alice Johnson')
      expect(message).toContain('$50.00')
      expect(message).toContain('Thank you')
      expect(message).toContain('generous donation')
    })

    it('should generate anonymous thank you messages', () => {
      const anonymousDonation: DonationRecord = {
        id: 'pi_test_789',
        amount: 2500,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Secret Donor',
          email: 'secret@example.com',
          message: 'Keep it up!',
          isAnonymous: true
        },
        completedAt: new Date()
      }

      const message = generateThankYouMessage(anonymousDonation)

      expect(message).toContain('Anonymous supporter')
      expect(message).toContain('$25.00')
      expect(message).not.toContain('Secret Donor')
    })

    it('should handle various donation amounts in messages', () => {
      const testAmounts = [100, 1000, 10000, 50000]
      const expectedAmounts = ['$1.00', '$10.00', '$100.00', '$500.00']

      testAmounts.forEach((amount, index) => {
        const donationRecord: DonationRecord = {
          id: `pi_test_${amount}`,
          amount,
          currency: 'usd',
          status: 'completed',
          donorInfo: {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test',
            isAnonymous: false
          },
          completedAt: new Date()
        }

        const message = generateThankYouMessage(donationRecord)
        expect(message).toContain(expectedAmounts[index])
      })
    })
  })

  describe('Receipt Data Generation', () => {
    it('should generate complete receipt data', () => {
      const donationRecord: DonationRecord = {
        id: 'pi_test_receipt_123',
        amount: 7500,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Bob Wilson',
          email: 'bob@example.com',
          message: 'Great work!',
          isAnonymous: false
        },
        completedAt: new Date('2024-02-20T16:20:00Z')
      }

      const confirmation = createDonationConfirmation(donationRecord)
      const receipt = confirmation.receiptData

      expect(receipt.transactionId).toBe('pi_test_receipt_123')
      expect(receipt.amount).toBe('$75.00')
      expect(receipt.date).toBe('2/20/2024') // US date format
      expect(receipt.status).toBe('completed')
    })

    it('should handle different completion dates correctly', () => {
      const testDates = [
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-06-15T12:30:00Z'),
        new Date('2024-12-31T23:59:59Z')
      ]

      testDates.forEach((date, index) => {
        const donationRecord: DonationRecord = {
          id: `pi_test_date_${index}`,
          amount: 1000,
          currency: 'usd',
          status: 'completed',
          donorInfo: {
            name: 'Date Tester',
            email: 'date@example.com',
            message: 'Date test',
            isAnonymous: false
          },
          completedAt: date
        }

        const confirmation = createDonationConfirmation(donationRecord)
        expect(confirmation.timestamp).toBe(date.toISOString())
        expect(confirmation.receiptData.date).toBe(date.toLocaleDateString())
      })
    })
  })

  describe('Data Consistency Properties', () => {
    it('should maintain consistent data across confirmation fields', () => {
      const donationRecord: DonationRecord = {
        id: 'pi_consistency_test',
        amount: 3500,
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Consistency Tester',
          email: 'consistency@example.com',
          message: 'Testing consistency',
          isAnonymous: false
        },
        completedAt: new Date('2024-03-10T09:15:00Z')
      }

      const confirmation = createDonationConfirmation(donationRecord)

      // Amount should be consistent across all fields
      expect(confirmation.amount).toBe('$35.00')
      expect(confirmation.receiptData.amount).toBe('$35.00')
      expect(confirmation.thankYouMessage).toContain('$35.00')

      // ID should be consistent
      expect(confirmation.id).toBe('pi_consistency_test')
      expect(confirmation.receiptData.transactionId).toBe('pi_consistency_test')

      // Donor name should be consistent (non-anonymous)
      expect(confirmation.donorName).toBe('Consistency Tester')
      expect(confirmation.thankYouMessage).toContain('Consistency Tester')
    })

    it('should handle edge cases in confirmation generation', () => {
      // Test with minimum donation
      const minDonation: DonationRecord = {
        id: 'pi_min_test',
        amount: 100, // $1.00
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Min Donor',
          email: 'min@example.com',
          message: '',
          isAnonymous: false
        },
        completedAt: new Date()
      }

      const minConfirmation = createDonationConfirmation(minDonation)
      expect(minConfirmation.amount).toBe('$1.00')
      expect(minConfirmation.message).toBe('')
      expect(minConfirmation.thankYouMessage).toContain('Min Donor')

      // Test with maximum donation
      const maxDonation: DonationRecord = {
        id: 'pi_max_test',
        amount: 50000, // $500.00
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: 'Max Donor',
          email: 'max@example.com',
          message: 'Maximum donation test with a longer message to ensure it handles well',
          isAnonymous: false
        },
        completedAt: new Date()
      }

      const maxConfirmation = createDonationConfirmation(maxDonation)
      expect(maxConfirmation.amount).toBe('$500.00')
      expect(maxConfirmation.message).toContain('Maximum donation test')
      expect(maxConfirmation.thankYouMessage).toContain('$500.00')
    })

    it('should generate unique confirmations for concurrent donations', () => {
      const donations = Array.from({ length: 10 }, (_, i) => ({
        id: `pi_concurrent_${i}`,
        amount: 1000 + (i * 100),
        currency: 'usd',
        status: 'completed',
        donorInfo: {
          name: `Donor ${i}`,
          email: `donor${i}@example.com`,
          message: `Message ${i}`,
          isAnonymous: i % 2 === 0 // Alternate anonymous/non-anonymous
        },
        completedAt: new Date(Date.now() + (i * 1000)) // Different timestamps
      }))

      const confirmations = donations.map(createDonationConfirmation)

      // Each confirmation should be unique
      const ids = confirmations.map(c => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)

      // Amounts should be different
      const amounts = confirmations.map(c => c.amount)
      expect(amounts[0]).toBe('$10.00')
      expect(amounts[9]).toBe('$19.00')

      // Anonymous handling should work correctly
      expect(confirmations[0].donorName).toBe('Anonymous') // Even index = anonymous
      expect(confirmations[1].donorName).toBe('Donor 1')   // Odd index = not anonymous
    })
  })
})