import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin, getAllUsers, updateUserRole } from '@/lib/admin-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request)
    const users = await getAllUsers(adminUser)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users - Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request)
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    const validRoles = ['ADMIN', 'MODERATOR', 'USER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const success = await updateUserRole(userId, role, adminUser)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'User role updated successfully',
      userId,
      newRole: role
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      if (error.message === 'Only admins can change user roles' || 
          error.message === 'Cannot demote yourself') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
