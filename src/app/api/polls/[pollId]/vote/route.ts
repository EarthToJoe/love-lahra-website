import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


// POST /api/polls/[pollId]/vote - Submit a vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params
    const body = await request.json()
    const { userId, optionId } = body

    // Validate required fields
    if (!userId || !optionId) {
      return NextResponse.json(
        { error: 'userId and optionId are required' },
        { status: 400 }
      )
    }

    // Check if poll exists and is active
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true
      }
    })

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (!poll.isActive) {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      )
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return NextResponse.json(
        { error: 'Poll has expired' },
        { status: 400 }
      )
    }

    // Validate option exists
    const option = poll.options.find(opt => opt.id === optionId)
    if (!option) {
      return NextResponse.json(
        { error: 'Option not found' },
        { status: 404 }
      )
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has already voted (if multiple votes not allowed)
    if (!poll.allowMultipleVotes) {
      const existingVote = await prisma.vote.findFirst({
        where: {
          pollId,
          userId
        }
      })

      if (existingVote) {
        return NextResponse.json(
          { error: 'User has already voted on this poll' },
          { status: 400 }
        )
      }
    }

    // Create the vote
    const vote = await prisma.vote.create({
      data: {
        pollId,
        optionId,
        userId
      }
    })

    // Update vote count for the option
    await prisma.pollOption.update({
      where: { id: optionId },
      data: {
        voteCount: {
          increment: 1
        }
      }
    })

    // Get updated poll with vote counts
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
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

    if (!updatedPoll) {
      throw new Error('Failed to fetch updated poll')
    }

    // Calculate percentages
    const totalVotes = updatedPoll._count.votes
    const pollWithStats = {
      ...updatedPoll,
      totalVotes,
      options: updatedPoll.options.map(opt => ({
        ...opt,
        percentage: totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0
      }))
    }

    // Emit real-time update to all clients watching this poll
    if ((global as any).io) {
      (global as any).io.to(`poll-${pollId}`).emit('poll-updated', {
        pollId,
        poll: pollWithStats
      })
    }

    return NextResponse.json({ 
      vote,
      poll: pollWithStats
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting vote:', error)
    
    // Handle unique constraint violation (user already voted)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User has already voted on this poll' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// DELETE /api/polls/[pollId]/vote - Remove a vote (if allowed)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Find and delete the vote
    const vote = await prisma.vote.findFirst({
      where: {
        pollId,
        userId
      }
    })

    if (!vote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      )
    }

    // Delete the vote and decrement option count
    await prisma.$transaction([
      prisma.vote.delete({
        where: { id: vote.id }
      }),
      prisma.pollOption.update({
        where: { id: vote.optionId },
        data: {
          voteCount: {
            decrement: 1
          }
        }
      })
    ])

    // Get updated poll with vote counts
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
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

    if (!updatedPoll) {
      throw new Error('Failed to fetch updated poll')
    }

    // Calculate percentages
    const totalVotes = updatedPoll._count.votes
    const pollWithStats = {
      ...updatedPoll,
      totalVotes,
      options: updatedPoll.options.map(opt => ({
        ...opt,
        percentage: totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0
      }))
    }

    // Emit real-time update
    if ((global as any).io) {
      (global as any).io.to(`poll-${pollId}`).emit('poll-updated', {
        pollId,
        poll: pollWithStats
      })
    }

    return NextResponse.json({ 
      message: 'Vote removed successfully',
      poll: pollWithStats
    })

  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}
