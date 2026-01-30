import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/comments/[commentId]/like - Like/unlike a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const { userId, action } = body

    // Validate input
    if (!userId || !action || !['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { error: 'userId and action (like/unlike) are required' },
        { status: 400 }
      )
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
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

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Update likes count
    const newLikeCount = action === 'like' 
      ? comment.likes + 1 
      : Math.max(0, comment.likes - 1)

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { likes: newLikeCount },
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

    // Emit real-time update to all clients watching this content
    if ((global as any).io) {
      (global as any).io.to(`comments-${comment.contentId}`).emit('comment-update', {
        commentId,
        comment: updatedComment
      })
    }

    return NextResponse.json({ 
      comment: updatedComment,
      userLiked: action === 'like',
      message: action === 'like' ? 'Comment liked' : 'Comment unliked'
    })

  } catch (error) {
    console.error('Error liking comment:', error)
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    )
  }
}

// GET /api/comments/[commentId]/like - Get comment like info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { likes: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      totalLikes: comment.likes
    })

  } catch (error) {
    console.error('Error checking comment like:', error)
    return NextResponse.json(
      { error: 'Failed to check comment like' },
      { status: 500 }
    )
  }
}
