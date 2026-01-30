import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    const adminUser = await isAdmin()
    
    if (adminUser) {
      return NextResponse.json({
        isAdmin: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          displayName: adminUser.displayName,
          role: adminUser.role,
        }
      })
    }
    
    return NextResponse.json({ isAdmin: false }, { status: 403 })
  } catch (error) {
    console.error('Error checking admin access:', error)
    return NextResponse.json({ isAdmin: false, error: 'Failed to check access' }, { status: 500 })
  }
}
