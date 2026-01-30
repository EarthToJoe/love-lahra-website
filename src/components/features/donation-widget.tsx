'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { useCreatePaymentIntent } from '@/hooks/useDonations'
import { DONATION_CONFIG, formatAmount, getStripePublishableKey } from '@/lib/stripe'

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey())

interface DonationWidgetProps {
  className?: string
}

export function DonationWidget({ className }: DonationWidgetProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className={`bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">💝</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Support Lahra's Content</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Love the content? Your support helps keep this digital diary running and growing!
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {DONATION_CONFIG.suggestedAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setShowModal(true)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors font-medium"
              >
                {formatAmount(amount)}
              </button>
            ))}
          </div>
          
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            💖 Make a Donation
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <Elements stripe={stripePromise}>
          <DonationForm onClose={() => setShowModal(false)} />
        </Elements>
      </Modal>
    </>
  )
}

interface DonationFormProps {
  onClose: () => void
}

function DonationForm({ onClose }: DonationFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { createPaymentIntent, loading: paymentLoading } = useCreatePaymentIntent()
  
  const [amount, setAmount] = useState(DONATION_CONFIG.defaultAmount)
  const [customAmount, setCustomAmount] = useState('')
  const [useCustomAmount, setUseCustomAmount] = useState(false)
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    isAnonymous: false,
  })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const finalAmount = useCustomAmount 
    ? Math.round(parseFloat(customAmount || '0') * 100) 
    : amount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet')
      return
    }

    if (finalAmount < DONATION_CONFIG.minimumAmount) {
      setError(`Minimum donation is ${formatAmount(DONATION_CONFIG.minimumAmount)}`)
      return
    }

    if (finalAmount > DONATION_CONFIG.maximumAmount) {
      setError(`Maximum donation is ${formatAmount(DONATION_CONFIG.maximumAmount)}`)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent(finalAmount, donorInfo)

      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorInfo.name || undefined,
            email: donorInfo.email || undefined,
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
        <p className="text-gray-600 mb-6">
          Your donation of {formatAmount(finalAmount)} has been processed successfully.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You should receive a confirmation email shortly.
        </p>
        <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
          Close
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Selection */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-4 block">
          Choose Amount
        </Label>
        
        {/* Suggested Amounts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {DONATION_CONFIG.suggestedAmounts.map((suggestedAmount) => (
            <button
              key={suggestedAmount}
              type="button"
              onClick={() => {
                setAmount(suggestedAmount)
                setUseCustomAmount(false)
              }}
              className={`p-3 rounded-lg border-2 transition-colors ${
                !useCustomAmount && amount === suggestedAmount
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              {formatAmount(suggestedAmount)}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="customAmount"
            checked={useCustomAmount}
            onChange={(e) => setUseCustomAmount(e.target.checked)}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <Label htmlFor="customAmount">Custom amount</Label>
          {useCustomAmount && (
            <Input
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min={DONATION_CONFIG.minimumAmount / 100}
              max={DONATION_CONFIG.maximumAmount / 100}
              step="0.01"
              className="w-24"
            />
          )}
        </div>
      </div>

      {/* Donor Information */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-gray-900">
          Donor Information (Optional)
        </Label>
        
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            id="anonymous"
            checked={donorInfo.isAnonymous}
            onChange={(e) => setDonorInfo(prev => ({ ...prev, isAnonymous: e.target.checked }))}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <Label htmlFor="anonymous">Make this donation anonymous</Label>
        </div>

        {!donorInfo.isAnonymous && (
          <>
            <div>
              <Label htmlFor="donorName">Name</Label>
              <Input
                id="donorName"
                value={donorInfo.name}
                onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            
            <div>
              <Label htmlFor="donorEmail">Email</Label>
              <Input
                id="donorEmail"
                type="email"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </>
        )}
        
        <div>
          <Label htmlFor="donorMessage">Message (Optional)</Label>
          <textarea
            id="donorMessage"
            value={donorInfo.message}
            onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Leave a message for Lahra..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          Payment Information
        </Label>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || paymentLoading}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          {processing ? 'Processing...' : `Donate ${formatAmount(finalAmount)}`}
        </Button>
      </div>
    </form>
  )
}