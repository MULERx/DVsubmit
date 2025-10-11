import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { paymentSchema } from '@/lib/validations/application'

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
    const validationResult = paymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid payment reference format',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      )
    }

    const { paymentReference } = validationResult.data

    // Find the user's current application that needs payment
    const application = await prisma.application.findFirst({
      where: {
        userId: userWithRole.dbUser.id,
        status: 'PAYMENT_PENDING',
        paymentReference: null, // Only applications without payment reference
      },
      orderBy: {
        createdAt: 'desc', // Get the most recent one
      },
    })

    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'APPLICATION_NOT_FOUND', 
            message: 'No application awaiting payment found. Please complete the form first or payment has already been submitted.' 
          } 
        },
        { status: 404 }
      )
    }

    // Check if payment reference is already used by another application
    const existingPayment = await prisma.application.findFirst({
      where: {
        paymentReference,
        id: { not: application.id },
      },
    })

    if (existingPayment) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DUPLICATE_PAYMENT_REFERENCE', 
            message: 'This payment reference has already been used.' 
          } 
        },
        { status: 400 }
      )
    }

    // Update application with payment reference and change status
    const updatedApplication = await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        paymentReference,
        paymentStatus: 'PENDING',
        status: 'PAYMENT_PENDING',
        updatedAt: new Date(),
      },
    })

    // Log the payment submission
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'PAYMENT_REFERENCE_SUBMITTED',
        details: {
          paymentReference,
          previousStatus: application.status,
          newStatus: 'PAYMENT_PENDING',
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
        paymentReference: updatedApplication.paymentReference,
        paymentStatus: updatedApplication.paymentStatus,
        status: updatedApplication.status,
        updatedAt: updatedApplication.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error submitting payment reference:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to submit payment reference' 
        } 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Get the user's current application payment status
    const application = await prisma.application.findFirst({
      where: {
        userId: userWithRole.dbUser.id,
        status: { in: ['PAYMENT_PENDING', 'PAYMENT_VERIFIED'] },
      },
      select: {
        id: true,
        paymentReference: true,
        paymentStatus: true,
        status: true,
        paymentVerifiedAt: true,
        paymentVerifiedBy: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'PAYMENT_NOT_FOUND', 
            message: 'No payment information found' 
          } 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch payment status' 
        } 
      },
      { status: 500 }
    )
  }
}