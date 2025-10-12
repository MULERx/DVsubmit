import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function POST(request: NextRequest) {
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

    const { applicationId, rejectionNote } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Application ID is required' } },
        { status: 400 }
      )
    }

    if (!rejectionNote || !rejectionNote.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Rejection note is required' } },
        { status: 400 }
      )
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Only allow rejecting applications that are not already submitted
    if (application.status === 'SUBMITTED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Cannot reject submitted applications' } },
        { status: 400 }
      )
    }

    // Update application status to APPLICATION_REJECTED
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'APPLICATION_REJECTED',
        rejectionNote: rejectionNote.trim(),
        updatedAt: new Date()
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'APPLICATION_REJECTED',
        details: {
          adminEmail: userWithRole.dbUser.email,
          applicantEmail: application.user.email,
          applicantName: `${application.givenName} ${application.familyName}`,
          previousStatus: application.status,
          rejectionNote: rejectionNote.trim(),
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application rejected successfully'
    })

  } catch (error) {
    console.error('Error rejecting application:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reject application'
        }
      },
      { status: 500 }
    )
  }
}