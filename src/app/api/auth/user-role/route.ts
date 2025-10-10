import { NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET() {
  try {
    const userWithRole = await authServer.getUserWithRole()

    if (!userWithRole) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      supabaseUser: {
        id: userWithRole.supabaseUser.id,
        email: userWithRole.supabaseUser.email,
      },
      dbUser: userWithRole.dbUser,
      isAuthenticated: true,
      isAdmin: userWithRole.dbUser?.role === 'ADMIN' || userWithRole.dbUser?.role === 'SUPER_ADMIN',
      isSuperAdmin: userWithRole.dbUser?.role === 'SUPER_ADMIN',
      role: userWithRole.dbUser?.role || 'USER',
    })
  } catch (error) {
    console.error('Error getting user role:', error)
    return NextResponse.json(
      { error: 'Failed to get user role' },
      { status: 500 }
    )
  }
}