import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


// GET /api/polls - Fetch all active polls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    // Fetch polls from database
    const polls = await prisma.poll.findMany({
      where,
      include: {
        options: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Calculate vote percentages for each poll
    const pollsWithStats = polls.map(poll => {
      const totalVotes = poll._count.votes
      const optionsWithPercentage = poll.options.map(option => ({
        ...option,
        percentage: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0
      }))

      return {
        ...poll,
        options: optionsWithPercentage,
        totalVotes
      }
    })

    return NextResponse.json({ polls: pollsWithStats })

  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}

// POST /api/polls - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, description, options, allowMultipleVotes, expiresAt } = body

    // Validate required fields
    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      )
    }

    // Create new poll with options in database
    const newPoll = await prisma.poll.create({
      data: {
        question,
        description,
        allowMultipleVotes: allowMultipleVotes || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        options: {
          create: options.map((option: any, index: number) => ({
            text: option.text,
            image: option.image || null,
            order: index
          }))
        }
      },
      include: {
        options: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    // Add vote statistics
    const pollWithStats = {
      ...newPoll,
      totalVotes: 0,
      options: newPoll.options.map(option => ({
        ...option,
        percentage: 0
      }))
    }

    return NextResponse.json({ poll: pollWithStats }, { status: 201 })

  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
