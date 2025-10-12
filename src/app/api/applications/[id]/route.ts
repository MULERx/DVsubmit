import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const {id: applicationId} = await params

    // Get the application and verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userWithRole.dbUser.id,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Log the access
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'APPLICATION_VIEWED',
        details: {
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
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch application' 
        } 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const applicationId = params.id

    // Get the application and verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userWithRole.dbUser.id,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Prevent deletion of submitted applications
    if (application.status === 'SUBMITTED' ) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CANNOT_DELETE_SUBMITTED', 
            message: 'Cannot delete submitted applications' 
          } 
        },
        { status: 400 }
      )
    }

    // Delete related audit logs first (due to foreign key constraints)
    await prisma.auditLog.deleteMany({
      where: {
        applicationId: application.id,
      },
    })

    // Delete the application
    await prisma.application.delete({
      where: {
        id: applicationId,
      },
    })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        action: 'APPLICATION_DELETED',
        details: {
          deletedApplicationId: applicationId,
          applicantName: `${application.givenName} ${application.familyName}`,
          status: application.status,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to delete application' 
        } 
      },
      { status: 500 }
    )
  }
}