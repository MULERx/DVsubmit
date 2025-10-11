import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, role: true }
    })

    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { action } = await request.json()
    const applicationId = params.id

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        paymentReference: true,
        status: true,
        givenName: true,
        familyName: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if payment is in pending status
    if (application.status !== 'PAYMENT_PENDING') {
      return NextResponse.json(
        { error: 'Payment is not in pending status' },
        { status: 400 }
      )
    }

    // Check if payment reference exists
    if (!application.paymentReference && action === 'approve') {
      return NextResponse.json(
        { error: 'No payment reference found for this application' },
        { status: 400 }
      )
    }

    // Update application based on action
    const updateData: any = {
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: dbUser.id,
      updatedAt: new Date(),
    }

    if (action === 'approve') {
      updateData.status = 'PAYMENT_VERIFIED'
    } else {
      updateData.status = 'PAYMENT_REJECTED'
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
      select: {
        id: true,
        status: true,
        paymentReference: true,
        paymentVerifiedAt: true,
        givenName: true,
        familyName: true,
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        applicationId: applicationId,
        action: action === 'approve' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
        details: {
          paymentReference: application.paymentReference,
          previousStatus: application.status,
          newStatus: updateData.status,
          adminId: dbUser.id,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        application: updatedApplication,
        action: action,
        message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      }
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update payment status' 
      },
      { status: 500 }
    )
  }
}