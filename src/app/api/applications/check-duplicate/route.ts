import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check for existing applications in the current DV cycle
    // For now, we'll consider any non-expired application as a potential duplicate
    const existingApplications = await prisma.application.findMany({
      where: {
        userId: userWithRole.dbUser.id,
        status: {
          not: 'EXPIRED'
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        confirmationNumber: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Check if there's already a submitted application
    const submittedApplication = existingApplications.find(app => 
      app.status === 'SUBMITTED' || app.status === 'CONFIRMED'
    )

    // Check if there's a pending application (payment pending or verified)
    const pendingApplication = existingApplications.find(app => 
      app.status === 'PAYMENT_PENDING' || app.status === 'PAYMENT_VERIFIED'
    )

    const hasDuplicate = !!(submittedApplication || pendingApplication)
    const canSubmit = !hasDuplicate

    return NextResponse.json({
      success: true,
      data: {
        canSubmit,
        hasDuplicate,
        existingApplications: existingApplications.map(app => ({
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
          submittedAt: app.submittedAt,
          confirmationNumber: app.confirmationNumber,
        })),
        message: hasDuplicate 
          ? 'You already have an active application for the current DV cycle'
          : 'You can submit a new application'
      }
    })
  } catch (error) {
    console.error('Error checking for duplicate applications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to check for duplicate applications' 
        } 
      },
      { status: 500 }
    )
  }
}