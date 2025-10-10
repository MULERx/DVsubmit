import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET() {
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

    // Allow multiple applications per user since one person can submit for family members
    // Always allow new applications - users can submit for multiple people
    const hasDuplicate = false
    const canSubmit = true

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
        message: 'You can submit multiple applications for different people'
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