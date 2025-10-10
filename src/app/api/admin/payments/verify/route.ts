import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { z } from 'zod'

const verifyPaymentSchema = z.object({
  applicationId: z.string(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const userWithRole = await authServer.getUserWithRole()
    const isAdmin = await authServer.isAdmin()
    
    if (!isAdmin || !userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = verifyPaymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid request data',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      )
    }

    const { applicationId, action, notes } = validationResult.data

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'APPLICATION_NOT_FOUND', 
            message: 'Application not found' 
          } 
        },
        { status: 404 }
      )
    }

    // Check if application is in the correct state for payment verification
    if (application.status !== 'PAYMENT_PENDING') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_STATUS', 
            message: 'Application is not pending payment verification' 
          } 
        },
        { status: 400 }
      )
    }

    // Update application based on action
    const updateData: any = {
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: userWithRole.dbUser.id,
      updatedAt: new Date(),
    }

    if (action === 'approve') {
      updateData.paymentStatus = 'VERIFIED'
      updateData.status = 'PAYMENT_VERIFIED'
    } else {
      updateData.paymentStatus = 'REJECTED'
      updateData.status = 'DRAFT' // Allow user to resubmit
      updateData.paymentReference = null // Clear the rejected reference
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    })

    // Log the admin action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: action === 'approve' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
        details: {
          previousStatus: application.status,
          newStatus: updateData.status,
          paymentReference: application.paymentReference,
          notes: notes || null,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        paymentStatus: updatedApplication.paymentStatus,
        paymentVerifiedAt: updatedApplication.paymentVerifiedAt,
        paymentVerifiedBy: updatedApplication.paymentVerifiedBy,
      },
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to verify payment' 
        } 
      },
      { status: 500 }
    )
  }
}