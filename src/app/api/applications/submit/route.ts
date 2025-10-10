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

    // Allow multiple applications per user since they can submit for family members
    // Each application represents a different person's DV lottery entry

    const applicationData = validationResult.data

    // Check if there's a matching draft application for this specific person
    // Match by name and date of birth to find the correct draft
    let application = await prisma.application.findFirst({
      where: {
        userId: userWithRole.dbUser.id,
        status: 'DRAFT',
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        dateOfBirth: new Date(applicationData.dateOfBirth)
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