import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/comments/[commentId]/moderate - Moderate a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const { action, moderatorId } = body

    // Validate input
    if (!action || !['approve', 'reject', 'hide'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve, reject, hide) is required' },
        { status: 400 }
      )
    }

    if (!moderatorId) {
      return NextResponse.json(
        { error: 'moderatorId is required' },
        { status: 400 }
      )
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Update moderation status
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        isModerated: true,
        isApproved: action === 'approve',
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ 
      comment: updatedComment,
      message: `Comment ${action}ed successfully`
    })

  } catch (error) {
    console.error('Error moderating comment:', error)
    return NextResponse.json(
      { error: 'Failed to moderate comment' },
      { status: 500 }
    )
  }
}

// GET /api/comments/[commentId]/moderate - Get moderation info for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        isModerated: true,
        isApproved: true
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      commentId,
      isModerated: comment.isModerated,
      isApproved: comment.isApproved
    })

  } catch (error) {
    console.error('Error getting comment moderation info:', error)
    return NextResponse.json(
      { error: 'Failed to get moderation info' },
      { status: 500 }
    )
  }
}
