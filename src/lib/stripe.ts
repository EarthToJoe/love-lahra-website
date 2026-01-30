import Stripe from 'stripe'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Client-side Stripe configuration
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key'
}

// Donation configuration
export const DONATION_CONFIG = {
  currency: 'usd',
  minimumAmount: 100, // $1.00 in cents
  maximumAmount: 50000, // $500.00 in cents
  suggestedAmounts: [500, 1000, 2500, 5000], // $5, $10, $25, $50
  defaultAmount: 1000, // $10
}

// Format amount for display
export const formatAmount = (amountInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100)
}

// Validate donation amount
export const validateDonationAmount = (amount: number): { valid: boolean; error?: string } => {
  if (!amount || amount < DONATION_CONFIG.minimumAmount) {
    return { 
      valid: false, 
      error: `Minimum donation is ${formatAmount(DONATION_CONFIG.minimumAmount)}` 
    }
  }
  
  if (amount > DONATION_CONFIG.maximumAmount) {
    return { 
      valid: false, 
      error: `Maximum donation is ${formatAmount(DONATION_CONFIG.maximumAmount)}` 
    }
  }
  
  return { valid: true }
}

// Create payment intent
export const createPaymentIntent = async (
  amount: number,
  donorInfo?: {
    name?: string
    email?: string
    message?: string
    isAnonymous?: boolean
  }
): Promise<Stripe.PaymentIntent> => {
  const validation = validateDonationAmount(amount)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Sanitize donor information to prevent XSS
  const sanitizedDonorInfo = donorInfo ? {
    name: sanitizeInput(donorInfo.name || 'Anonymous', 500),
    email: sanitizeInput(donorInfo.email || '', 254),
    message: sanitizeInput(donorInfo.message || '', 1000),
    isAnonymous: donorInfo.isAnonymous
  } : undefined

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: DONATION_CONFIG.currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      donorName: sanitizedDonorInfo?.name || 'Anonymous',
      donorEmail: sanitizedDonorInfo?.email || '',
      donorMessage: sanitizedDonorInfo?.message || '',
      isAnonymous: sanitizedDonorInfo?.isAnonymous ? 'true' : 'false',
      timestamp: new Date().toISOString(),
    },
  })

  return paymentIntent
}

// Sanitize input to prevent XSS and limit length
const sanitizeInput = (input: string, maxLength: number): string => {
  if (!input) return ''
  
  // Remove script tags and dangerous HTML
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onerror=
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

// Handle webhook events
export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handleSuccessfulPayment(paymentIntent)
      break
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handleFailedPayment(failedPayment)
      break
    
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

// Handle successful payment
const handleSuccessfulPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  console.log('Payment succeeded:', paymentIntent.id)
  
  // In a real app, you would:
  // 1. Save donation to database
  // 2. Send thank you email
  // 3. Update donor recognition
  // 4. Trigger any post-donation workflows
  
  const donationRecord = {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'completed',
    donorInfo: {
      name: paymentIntent.metadata.donorName,
      email: paymentIntent.metadata.donorEmail,
      message: paymentIntent.metadata.donorMessage,
      isAnonymous: paymentIntent.metadata.isAnonymous === 'true',
    },
    completedAt: new Date(),
  }
  
  // Mock: Log successful donation
  console.log('Donation completed:', donationRecord)
  
  return donationRecord
}

// Handle failed payment
const handleFailedPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  console.log('Payment failed:', paymentIntent.id)
  
  // In a real app, you would:
  // 1. Log the failure
  // 2. Notify admin if needed
  // 3. Update donation status
  
  const failureRecord = {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    status: 'failed',
    failedAt: new Date(),
  }
  
  console.log('Donation failed:', failureRecord)
  
  return failureRecord
}