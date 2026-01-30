import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// GET - Fetch content sections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const published = searchParams.get('published')

    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (published === 'true') {
      where.isPublished = true
    }

    const contentSections = await prisma.contentSection.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contentSections)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

// POST - Create new content section (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const adminUser = await isAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, title, content, metadata, isPublished, publishedAt } = body

    // Validate required fields
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, content' },
        { status: 400 }
      )
    }

    // Create content section
    const contentSection = await prisma.contentSection.create({
      data: {
        type,
        title,
        content,
        metadata: metadata || {},
        isPublished: isPublished || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null
      },
      include: {
        images: true
      }
    })

    return NextResponse.json(contentSection, { status: 201 })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}

// PUT - Update content section (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin access
    const adminUser = await isAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, type, title, content, metadata, isPublished, publishedAt } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Update content section
    const contentSection = await prisma.contentSection.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(content && { content }),
        ...(metadata && { metadata }),
        ...(typeof isPublished === 'boolean' && { isPublished }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) })
      },
      include: {
        images: true
      }
    })

    return NextResponse.json(contentSection)
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

// DELETE - Delete content section (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    const adminUser = await isAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Delete content section (images will be cascade deleted)
    await prisma.contentSection.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
