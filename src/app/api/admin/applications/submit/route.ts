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

    const { applicationId, confirmationNumber } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Application ID is required' } },
        { status: 400 }
      )
    }

    if (!confirmationNumber || !confirmationNumber.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'DV confirmation number is required' } },
        { status: 400 }
      )
    }

    // Validate confirmation number format (basic validation)
    const dvPattern = /^20\d{2}[A-Z0-9]{10}$/i
    if (!dvPattern.test(confirmationNumber.trim())) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid DV confirmation number format' } },
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

    // Only allow submitting applications with verified payment
    if (application.status !== 'PAYMENT_VERIFIED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Application must have verified payment before submission' } },
        { status: 400 }
      )
    }

    // Check if confirmation number is already used
    const existingApplication = await prisma.application.findFirst({
      where: {
        confirmationNumber: confirmationNumber.trim().toUpperCase(),
        id: { not: applicationId }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_CONFIRMATION', message: 'This confirmation number is already in use' } },
        { status: 400 }
      )
    }

    // Update application status to SUBMITTED
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'SUBMITTED',
        confirmationNumber: confirmationNumber.trim().toUpperCase(),
        submittedAt: new Date(),
        submittedBy: userWithRole.dbUser.email,
        updatedAt: new Date()
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'APPLICATION_SUBMITTED',
        details: {
          adminEmail: userWithRole.dbUser.email,
          applicantEmail: application.user.email,
          applicantName: `${application.givenName} ${application.familyName}`,
          confirmationNumber: confirmationNumber.trim().toUpperCase(),
          previousStatus: application.status,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application submitted successfully'
    })

  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to submit application' 
        } 
      },
      { status: 500 }
    )
  }
}