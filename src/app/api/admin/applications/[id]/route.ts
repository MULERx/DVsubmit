import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    const isAdmin = await authServer.isAdmin()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const applicationId = params.id

    // Get the application with user information
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Log the access
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'ADMIN_APPLICATION_VIEWED',
        details: {
          adminEmail: userWithRole.dbUser.email,
          applicantEmail: application.user.email,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch application' 
        } 
      },
      { status: 500 }
    )
  }
}