import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user preferences or create default ones
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    })
    
    if (!preferences) {
      // Create default preferences for new user
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          emailNotifications: true,
          pushNotifications: true,
          commentNotifications: true,
          newContentNotifications: true,
          pollNotifications: true,
          showProfile: true,
          allowMentions: true
        }
      })
    }

    return NextResponse.json({ preferences })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences: newPreferences } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate preference fields
    const validFields = [
      'emailNotifications',
      'pushNotifications', 
      'commentNotifications',
      'newContentNotifications',
      'pollNotifications',
      'showProfile',
      'allowMentions'
    ]

    const filteredPreferences: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(newPreferences)) {
      if (validFields.includes(key) && typeof value === 'boolean') {
        filteredPreferences[key] = value
      }
    }

    // Upsert preferences (update if exists, create if not)
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: filteredPreferences,
      create: {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        commentNotifications: true,
        newContentNotifications: true,
        pollNotifications: true,
        showProfile: true,
        allowMentions: true,
        ...filteredPreferences
      }
    })

    return NextResponse.json({ 
      preferences: updatedPreferences,
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

// PATCH /api/user/preferences - Partially update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, field, value } = body

    if (!userId || !field) {
      return NextResponse.json(
        { error: 'User ID and field are required' },
        { status: 400 }
      )
    }

    // Validate field
    const validFields = [
      'emailNotifications',
      'pushNotifications', 
      'commentNotifications',
      'newContentNotifications',
      'pollNotifications',
      'showProfile',
      'allowMentions'
    ]

    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: 'Invalid preference field' },
        { status: 400 }
      )
    }

    if (typeof value !== 'boolean') {
      return NextResponse.json(
        { error: 'Preference value must be boolean' },
        { status: 400 }
      )
    }

    // Upsert preferences with specific field update
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: { [field]: value },
      create: {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        commentNotifications: true,
        newContentNotifications: true,
        pollNotifications: true,
        showProfile: true,
        allowMentions: true,
        [field]: value
      }
    })

    return NextResponse.json({ 
      preferences,
      message: `${field} updated successfully`
    })

  } catch (error) {
    console.error('Error updating user preference:', error)
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    )
  }
}
