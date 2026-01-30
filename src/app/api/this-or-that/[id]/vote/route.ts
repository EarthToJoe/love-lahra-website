import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/this-or-that/[id]/vote - Vote on a This or That question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params
    const body = await request.json()
    const { choice, visitorId } = body

    // Validate input
    if (!choice || !visitorId || !['A', 'B'].includes(choice)) {
      return NextResponse.json(
        { error: 'Valid choice (A or B) and visitorId are required' },
        { status: 400 }
      )
    }

    // Find the question
    const question = await prisma.thisOrThat.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if question is active
    if (!question.isActive) {
      return NextResponse.json(
        { error: 'Question is not active' },
        { status: 400 }
      )
    }

    // Check if visitor has already voted on this question
    const existingVote = await prisma.thisOrThatVote.findUnique({
      where: {
        questionId_visitorId: {
          questionId,
          visitorId
        }
      }
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this question' },
        { status: 400 }
      )
    }

    // Record the vote in a transaction
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      // Create vote record
      await tx.thisOrThatVote.create({
        data: {
          questionId,
          visitorId,
          choice
        }
      })

      // Update vote count
      const updateData = choice === 'A' 
        ? { optionAVotes: { increment: 1 } }
        : { optionBVotes: { increment: 1 } }

      return await tx.thisOrThat.update({
        where: { id: questionId },
        data: updateData
      })
    })

    // Calculate percentages
    const totalVotes = updatedQuestion.optionAVotes + updatedQuestion.optionBVotes
    const percentageA = totalVotes > 0 ? Math.round((updatedQuestion.optionAVotes / totalVotes) * 100) : 0
    const percentageB = totalVotes > 0 ? Math.round((updatedQuestion.optionBVotes / totalVotes) * 100) : 0

    // Return updated question with percentages
    const formattedQuestion = {
      id: updatedQuestion.id,
      title: updatedQuestion.title,
      optionA: {
        image: updatedQuestion.optionAImage,
        label: updatedQuestion.optionALabel,
        votes: updatedQuestion.optionAVotes,
        percentage: percentageA
      },
      optionB: {
        image: updatedQuestion.optionBImage,
        label: updatedQuestion.optionBLabel,
        votes: updatedQuestion.optionBVotes,
        percentage: percentageB
      },
      totalVotes,
      createdAt: updatedQuestion.createdAt.toISOString(),
      isActive: updatedQuestion.isActive
    }

    return NextResponse.json({ 
      question: formattedQuestion,
      userChoice: choice,
      message: 'Vote recorded successfully'
    })

  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}
