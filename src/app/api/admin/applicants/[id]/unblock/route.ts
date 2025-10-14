import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
          const userWithRole = await authServer.getUserWithRole()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
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
        blocked: true 
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

    // Create audit log
    if (userWithRole) {
      await prisma.auditLog.create({
        data: {
          userId: userWithRole.dbUser?.id,
          action: 'user_unblocked',
          details: {
            targetUserId: userId,
            targetUserEmail: user.email,
            reason: 'Unblocked by admin'
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully'
    })

  } catch (error) {
    console.error('Error unblocking user:', error)
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    )
  }
}