import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status.toUpperCase()
    }

    // Fetch donations from database
    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            displayName: true,
            email: true
          }
        }
      }
    })

    // Calculate stats
    const completedDonations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' }
    })

    const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0)
    
    const totalDonors = new Set(
      completedDonations
        .filter(d => !d.isAnonymous && d.donorEmail)
        .map(d => d.donorEmail)
    ).size

    // Format donations for response
    const formattedDonations = donations.map(d => ({
      id: d.id,
      amount: d.amount,
      currency: d.currency.toLowerCase(),
      status: d.status.toLowerCase(),
      donorInfo: {
        name: d.isAnonymous ? 'Anonymous' : (d.donorName || d.user?.displayName || 'Anonymous'),
        email: d.isAnonymous ? '' : (d.donorEmail || d.user?.email || ''),
        message: d.donorMessage || '',
        isAnonymous: d.isAnonymous
      },
      completedAt: d.completedAt,
      createdAt: d.createdAt
    }))

    return NextResponse.json({
      donations: formattedDonations,
      stats: {
        totalAmount,
        totalDonations: completedDonations.length,
        totalDonors,
        averageAmount: completedDonations.length > 0 ? totalAmount / completedDonations.length : 0,
      }
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}
