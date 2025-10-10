import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { applicationSchema } from '@/lib/validations/application'
import { ApiResponse } from '@/lib/types/application'

export async function GET(request: NextRequest) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Get user's applications
    const applications = await prisma.application.findMany({
      where: {
        userId: userWithRole.dbUser.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: applications,
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch applications' 
        } 
      },
      { status: 500 }
    )
  }
}

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

    const applicationData = validationResult.data

    // Check if user already has a draft application for the current DV cycle
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: userWithRole.dbUser.id,
        status: 'DRAFT',
      },
    })

    let application

    if (existingApplication) {
      // Update existing draft application
      application = await prisma.application.update({
        where: {
          id: existingApplication.id,
        },
        data: {
          ...applicationData,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new application
      application = await prisma.application.create({
        data: {
          ...applicationData,
          userId: userWithRole.dbUser.id,
          status: 'DRAFT',
        },
      })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: existingApplication ? 'APPLICATION_UPDATED' : 'APPLICATION_CREATED',
        details: {
          fields: Object.keys(applicationData),
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
    console.error('Error creating/updating application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to save application' 
        } 
      },
      { status: 500 }
    )
  }
}