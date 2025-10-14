import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is super admin
    const isSuperAdmin = await authServer.isSuperAdmin()
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    // Check if user exists and is blocked
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        blocked: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.blocked) {
      return NextResponse.json(
        { error: 'User is not blocked' },
        { status: 400 }
      )
    }

    // Unblock the user
    await prisma.user.update({
      where: { id: userId },
      data: { 
        blocked: false,
        blockedAt: null,
        blockedBy: null
      }
    })

    // Create audit log (optional - don't fail if this fails)
    const currentUser = await authServer.getCurrentUser()
    if (currentUser?.id) {
      try {
        // Verify the current user exists in the database
        const userExists = await prisma.user.findUnique({
          where: { id: currentUser.id },
          select: { id: true }
        })
        
        if (userExists) {
          await prisma.auditLog.create({
            data: {
              userId: currentUser.id,
              action: 'admin_user_unblocked',
              details: {
                targetUserId: userId,
                targetUserEmail: user.email,
                targetUserRole: user.role,
                reason: 'Unblocked by super admin'
              }
            }
          })
        }
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError)
        // Continue execution - don't fail the main operation
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user unblocked successfully'
    })

  } catch (error) {
    console.error('Error unblocking admin user:', error)
    return NextResponse.json(
      { error: 'Failed to unblock admin user' },
      { status: 500 }
    )
  }
}