import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Force dynamic rendering to avoid build-time database connection

// GET /api/comments - Fetch comments for content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeReplies = searchParams.get('includeReplies') !== 'false'

    // Build where clause
    const where: any = {}
    if (contentId) {
      where.contentId = contentId
    }
    if (contentType) {
      where.contentType = contentType
    }

    // Always filter to top-level comments only (parentId is null)
    where.parentId = null

    // Fetch comments from database
    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        },
        replies: includeReplies ? {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ 
      comments,
      total: comments.length
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentType, userId, content, parentId } = body

    // Validate required fields
    if (!contentId || !contentType || !userId || !content) {
      return NextResponse.json(
        { error: 'contentId, contentType, userId, and content are required' },
        { status: 400 }
      )
    }

    // Validate content type
    const validContentTypes = ['CONTENT_SECTION', 'OUTFIT', 'POLL', 'GENERAL']
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    // Validate parent comment exists if parentId is provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      })
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Validate user exists (or create/find by email)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    // If user doesn't exist by ID, try to find by email
    if (!user && userId.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: userId }
      })
    }
    
    // If still no user, create one
    if (!user) {
      const displayName = userId.includes('@') 
        ? userId.split('@')[0] 
        : `User${Math.random().toString(36).substring(2, 6)}`
      
      user = await prisma.user.create({
        data: {
          email: userId.includes('@') ? userId : `${userId}@temp.com`,
          displayName,
          role: 'USER'
        }
      })
    }
    
    // Use the actual user ID from the database
    const actualUserId = user.id

    // Create new comment in database
    const newComment = await prisma.comment.create({
      data: {
        contentId,
        contentType: contentType as any,
        userId: actualUserId, // Use the actual database user ID
        content: content.trim(),
        parentId: parentId || null
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

    // Emit real-time update to all clients watching this content
    if ((global as any).io) {
      (global as any).io.to(`comments-${contentId}`).emit('new-comment', {
        contentId,
        comment: newComment
      })

      // Send notification to content owner or other users if it's a reply
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          include: { user: true }
        })
        
        if (parentComment && parentComment.userId !== userId) {
          // TODO: Fix notification creation - TypeScript error with Prisma client
          // Create notification in database
          // const notificationData = {
          //   userId: parentComment.userId,
          //   type: 'COMMENT_REPLY' as const,
          //   title: 'New Reply',
          //   message: `${user.displayName} replied to your comment`,
          //   data: { commentId: parentId, contentId }
          // }
          // await prisma.notification.create({ data: notificationData })

          // Emit real-time notification
          (global as any).io.to(`user-${parentComment.userId}`).emit('new-notification', {
            id: `notif_${Date.now()}_reply`,
            userId: parentComment.userId,
            type: 'COMMENT_REPLY',
            title: 'New Reply',
            message: `${user.displayName} replied to your comment`,
            data: { commentId: parentId, contentId },
            isRead: false,
            createdAt: new Date().toISOString()
          })
        }
      }
    }

    return NextResponse.json({ comment: newComment }, { status: 201 })

  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
