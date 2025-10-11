import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function PATCH(
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

    const { paymentReference } = await request.json()

    if (!paymentReference || typeof paymentReference !== 'string') {
      return NextResponse.json(
        { error: { message: 'Payment reference is required' } },
        { status: 400 }
      )
    }

    // Find the application and verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
        userId: userWithRole.dbUser.id,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Only allow updating payment reference for PAYMENT_REJECTED applications
    if (application.status !== 'PAYMENT_REJECTED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Payment reference can only be updated for rejected payments' } },
        { status: 400 }
      )
    }

    // Update the payment reference and reset status to PAYMENT_PENDING
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: {
        paymentReference: paymentReference.trim(),
        status: 'PAYMENT_PENDING',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication
    })

  } catch (error) {
    console.error('Error updating payment reference:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to update payment reference' 
        } 
      },
      { status: 500 }
    )
  }
}