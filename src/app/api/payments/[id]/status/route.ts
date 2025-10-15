import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { id } =  await params

    // Find the application and verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: userWithRole.dbUser.id,
      },
      select: {
        id: true,
        paymentReference: true,
        status: true,
        paymentVerifiedAt: true,
        paymentVerifiedBy: true,
        updatedAt: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'APPLICATION_NOT_FOUND',
            message: 'Application not found or access denied'
          }
        },
        { status: 404 }
      )
    }

    // Get additional payment verification details if verified
    let verificationDetails = null
    if (application.paymentVerifiedBy) {
      const verifier = await prisma.user.findUnique({
        where: { id: application.paymentVerifiedBy },
        select: { email: true },
      })
      verificationDetails = {
        verifiedBy: verifier?.email || 'Unknown',
        verifiedAt: application.paymentVerifiedAt,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        verificationDetails,
      },
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