import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/this-or-that - Fetch all active This or That questions
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

    // Fetch questions from database
    const questions = await prisma.thisOrThat.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Format questions for response
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      title: q.title,
      optionA: {
        image: q.optionAImage,
        label: q.optionALabel,
        votes: q.optionAVotes
      },
      optionB: {
        image: q.optionBImage,
        label: q.optionBLabel,
        votes: q.optionBVotes
      },
      totalVotes: q.optionAVotes + q.optionBVotes,
      createdAt: q.createdAt.toISOString(),
      isActive: q.isActive
    }))

    return NextResponse.json({ questions: formattedQuestions })

  } catch (error) {
    console.error('Error fetching This or That questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/this-or-that - Create a new This or That question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, optionA, optionB } = body

    // Validate required fields
    if (!title || !optionA?.image || !optionA?.label || !optionB?.image || !optionB?.label) {
      return NextResponse.json(
        { error: 'Title and both options with images and labels are required' },
        { status: 400 }
      )
    }

    // Create new question in database
    const newQuestion = await prisma.thisOrThat.create({
      data: {
        title,
        optionAImage: optionA.image,
        optionALabel: optionA.label,
        optionAVotes: 0,
        optionBImage: optionB.image,
        optionBLabel: optionB.label,
        optionBVotes: 0,
        isActive: true
      }
    })

    // Format response
    const formattedQuestion = {
      id: newQuestion.id,
      title: newQuestion.title,
      optionA: {
        image: newQuestion.optionAImage,
        label: newQuestion.optionALabel,
        votes: newQuestion.optionAVotes
      },
      optionB: {
        image: newQuestion.optionBImage,
        label: newQuestion.optionBLabel,
        votes: newQuestion.optionBVotes
      },
      totalVotes: 0,
      createdAt: newQuestion.createdAt.toISOString(),
      isActive: newQuestion.isActive
    }

    return NextResponse.json({ question: formattedQuestion }, { status: 201 })

  } catch (error) {
    console.error('Error creating This or That question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
