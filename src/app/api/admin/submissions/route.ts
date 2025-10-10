import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { z } from 'zod'

const submitDvSchema = z.object({
  applicationId: z.string(),
  confirmationNumber: z.string().min(1, 'Confirmation number is required'),
  notes: z.string().optional(),
})

const updateSubmissionSchema = z.object({
  applicationId: z.string(),
  status: z.enum(['SUBMITTED', 'CONFIRMED', 'FAILED']),
  confirmationNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'PAYMENT_VERIFIED'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Validate status parameter
    const validStatuses = ['PAYMENT_VERIFIED', 'SUBMITTED', 'CONFIRMED', 'FAILED']
    const status = validStatuses.includes(statusParam) ? statusParam as any : 'PAYMENT_VERIFIED'

    // Get applications ready for DV submission
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: {
          status: status,
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
        orderBy: {
          paymentVerifiedAt: 'asc', // Oldest verified payments first
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ 
        where: { status: status } 
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch submissions' 
        } 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const validationResult = submitDvSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid submission data',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      )
    }

    const { applicationId, confirmationNumber, notes } = validationResult.data

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

    // Check if application is ready for submission
    if (application.status !== 'PAYMENT_VERIFIED') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_STATUS', 
            message: 'Application is not ready for DV submission' 
          } 
        },
        { status: 400 }
      )
    }

    // Update application with submission details
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'SUBMITTED',
        confirmationNumber,
        submittedAt: new Date(),
        submittedBy: userWithRole.dbUser.id,
        updatedAt: new Date(),
      },
    })

    // Log the submission action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'DV_SUBMITTED',
        details: {
          previousStatus: application.status,
          newStatus: 'SUBMITTED',
          confirmationNumber,
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
        confirmationNumber: updatedApplication.confirmationNumber,
        submittedAt: updatedApplication.submittedAt,
        submittedBy: updatedApplication.submittedBy,
      },
    })
  } catch (error) {
    console.error('Error submitting to DV system:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to submit to DV system' 
        } 
      },
      { status: 500 }
    )
  }
}

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
    const validationResult = updateSubmissionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid update data',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      )
    }

    const { applicationId, status, confirmationNumber, notes } = validationResult.data

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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

    // Update application
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (confirmationNumber) {
      updateData.confirmationNumber = confirmationNumber
    }

    if (status === 'CONFIRMED' && !application.submittedAt) {
      updateData.submittedAt = new Date()
      updateData.submittedBy = userWithRole.dbUser.id
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    })

    // Log the update action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'SUBMISSION_STATUS_UPDATED',
        details: {
          previousStatus: application.status,
          newStatus: status,
          confirmationNumber: confirmationNumber || application.confirmationNumber,
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
        confirmationNumber: updatedApplication.confirmationNumber,
        submittedAt: updatedApplication.submittedAt,
        submittedBy: updatedApplication.submittedBy,
      },
    })
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to update submission' 
        } 
      },
      { status: 500 }
    )
  }
}