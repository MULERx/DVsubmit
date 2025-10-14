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

    // Prevent blocking admin users
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot block admin users' },
        { status: 400 }
      )
    }

    if (user.blocked) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 400 }
      )
    }


    // Block the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        blocked: true,
        blockedAt: new Date(),
        blockedBy: userWithRole?.dbUser?.id || null
      }
    })

    if (userWithRole) {
      await prisma.auditLog.create({
        data: {
          userId: userWithRole.dbUser?.id,
          action: 'user_blocked',
          details: {
            targetUserId: userId,
            targetUserEmail: user.email,
            reason: 'Blocked by admin'
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully'
    })

  } catch (error) {
    console.error('Error blocking user:', error)
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    )
  }
}