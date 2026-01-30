import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: 'ADMIN' | 'MODERATOR' | 'USER'
  avatar?: string | null
}

/**
 * Check if the current user is an admin or moderator
 */
export async function isAdmin(request?: NextRequest): Promise<AdminUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    // Fetch user from database to get current role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        avatar: true
      }
    })

    if (!user) {
      return null
    }

    // Check if user has admin or moderator privileges
    if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
      return user as AdminUser
    }

    return null
  } catch (error) {
    console.error('Error checking admin status:', error)
    return null
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(request?: NextRequest): Promise<AdminUser> {
  const adminUser = await isAdmin(request)
  
  if (!adminUser) {
    throw new Error('Admin access required')
  }
  
  return adminUser
}

/**
 * Check if user has specific admin permissions
 */
export async function hasPermission(
  permission: 'CONTENT_MANAGEMENT' | 'USER_MANAGEMENT' | 'MODERATION' | 'SYSTEM_SETTINGS',
  request?: NextRequest
): Promise<boolean> {
  const adminUser = await isAdmin(request)
  
  if (!adminUser) {
    return false
  }

  // Admin has all permissions
  if (adminUser.role === 'ADMIN') {
    return true
  }

  // Moderator has limited permissions
  if (adminUser.role === 'MODERATOR') {
    return ['CONTENT_MANAGEMENT', 'MODERATION'].includes(permission)
  }

  return false
}

/**
 * Middleware to protect admin routes
 */
export async function adminMiddleware(request: NextRequest) {
  try {
    await requireAdmin(request)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get current user (admin or regular user)
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        avatar: true
      }
    })

    return user as AdminUser | null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Create or update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: 'ADMIN' | 'MODERATOR' | 'USER',
  adminUser: AdminUser
): Promise<boolean> {
  try {
    // Only admins can change roles
    if (adminUser.role !== 'ADMIN') {
      throw new Error('Only admins can change user roles')
    }

    // Prevent admins from demoting themselves
    if (userId === adminUser.id && newRole !== 'ADMIN') {
      throw new Error('Cannot demote yourself')
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    return true
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

/**
 * Get all users with their roles (admin only)
 */
export async function getAllUsers(adminUser: AdminUser) {
  if (adminUser.role !== 'ADMIN') {
    throw new Error('Only admins can view all users')
  }

  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          comments: true,
          votes: true,
          donations: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}