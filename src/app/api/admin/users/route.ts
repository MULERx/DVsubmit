import { NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check if user is super admin
    const isCurrentUserSuperAdmin = await authServer.isSuperAdmin()
    if (!isCurrentUserSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only super admins can view admin users' },
        { status: 403 }
      )
    }

    // Get only admin and super admin users
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        blocked: true,
        blockedAt: true,
        blockedBy: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Error getting admin users:', error)
    
    return NextResponse.json(
      { error: 'Failed to get admin users' },
      { status: 500 }
    )
  }
}