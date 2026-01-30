import { NextRequest, NextResponse } from 'next/server'

import { createPaymentIntent, validateDonationAmount } from '@/lib/stripe'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, donorInfo } = body

    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required and must be a number' },
        { status: 400 }
      )
    }

    // Validate donation amount
    const validation = validateDonationAmount(amount)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, donorInfo)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
