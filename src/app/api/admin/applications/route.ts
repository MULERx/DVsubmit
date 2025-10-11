import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

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
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on filters
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Handle type-based filtering
    if (type) {
      switch (type) {
        case 'pendingPayment':
          where.status = 'PAYMENT_PENDING'
          break
        case 'pendingReview':
          where.status = 'PAYMENT_VERIFIED'
          break
        case 'paymentRejected':
          where.status = 'PAYMENT_REJECTED'
          break
        case 'applicationRejected':
          where.status = 'APPLICATION_REJECTED'
          break
        case 'submitted':
          where.status = 'SUBMITTED'
          break
        default:
          // Invalid type, ignore
          break
      }
    }

    // Get applications with user information
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
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
          createdAt: 'asc', // From old to new as requested
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
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
    console.error('Error fetching admin applications:', error)
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