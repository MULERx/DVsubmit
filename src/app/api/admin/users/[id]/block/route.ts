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

    // Check if user exists and is not already blocked
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

    // Prevent blocking super admin users (except self-blocking prevention is handled in UI)
    if (user.role === 'SUPER_ADMIN') {
      // Get current user to prevent self-blocking
      const currentUser = await authServer.getCurrentUser()
      if (currentUser?.id === userId) {
        return NextResponse.json(
          { error: 'Cannot block yourself' },
          { status: 400 }
        )
      }
    }

    if (user.blocked) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 400 }
      )
    }

    // Get current admin user for audit trail
    const currentUser = await authServer.getCurrentUser()
    
    // Block the user
    await prisma.user.update({
      where: { id: userId },
      data: { 
        blocked: true,
        blockedAt: new Date(),
        blockedBy: currentUser?.id || null
      }
    })

    // Create audit log (optional - don't fail if this fails)
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
              action: 'admin_user_blocked',
              details: {
                targetUserId: userId,
                targetUserEmail: user.email,
                targetUserRole: user.role,
                reason: 'Blocked by super admin'
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
      message: 'Admin user blocked successfully'
    })

  } catch (error) {
    console.error('Error blocking admin user:', error)
    return NextResponse.json(
      { error: 'Failed to block admin user' },
      { status: 500 }
    )
  }
}