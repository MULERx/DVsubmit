import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function PUT(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Update user role (this will check admin permissions internally)
    const success = await authServer.updateUserRole(userId, role)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}