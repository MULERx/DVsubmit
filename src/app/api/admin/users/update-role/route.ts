import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN'])
})

export async function PUT(request: NextRequest) {
  try {
    // Check if user is super admin
    const isCurrentUserSuperAdmin = await authServer.isSuperAdmin()
    if (!isCurrentUserSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only super admins can update user roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role } = updateRoleSchema.parse(body)

    // Get current user to prevent self-demotion
    const currentUser = await authServer.getCurrentUser()
    if (currentUser?.id === userId && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot demote yourself from super admin role' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}