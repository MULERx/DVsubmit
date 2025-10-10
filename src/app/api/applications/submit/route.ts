import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { applicationSchema } from '@/lib/validations/application'

export async function POST(request: NextRequest) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = applicationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid application data',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      )
    }

    // Check for duplicate submissions
    const existingSubmittedApplication = await prisma.application.findFirst({
      where: {
        userId: userWithRole.dbUser.id,
        status: {
          in: ['PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'SUBMITTED', 'CONFIRMED']
        }
      }
    })

    if (existingSubmittedApplication) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DUPLICATE_SUBMISSION', 
            message: 'You already have an active application for the current DV cycle',
            details: {
              existingApplicationId: existingSubmittedApplication.id,
              existingStatus: existingSubmittedApplication.status,
              submittedAt: existingSubmittedApplication.submittedAt
            }
          } 
        },
        { status: 409 }
      )
    }

    const applicationData = validationResult.data

    // Find existing draft application or create new one
    let application = await prisma.application.findFirst({
      where: {
        userId: userWithRole.dbUser.id,
        status: 'DRAFT'
      }
    })

    if (application) {
      // Update existing draft and change status to PAYMENT_PENDING
      application = await prisma.application.update({
        where: {
          id: application.id,
        },
        data: {
          ...applicationData,
          status: 'PAYMENT_PENDING',
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new application with PAYMENT_PENDING status
      application = await prisma.application.create({
        data: {
          ...applicationData,
          userId: userWithRole.dbUser.id,
          status: 'PAYMENT_PENDING',
        },
      })
    }

    // Log the submission action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'APPLICATION_SUBMITTED_FOR_PAYMENT',
        details: {
          previousStatus: 'DRAFT',
          newStatus: 'PAYMENT_PENDING',
          timestamp: new Date().toISOString(),
          formData: {
            hasPersonalInfo: !!(applicationData.firstName && applicationData.lastName),
            hasContactInfo: !!(applicationData.email && applicationData.phone),
            hasEducationInfo: !!(applicationData.education && applicationData.occupation),
          }
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully. Please proceed to payment.'
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