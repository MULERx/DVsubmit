import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
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
            select: { role: true }
        })

        if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            )
        }

        // Get statistics
        const [
            totalSubmittedApplications,
            pendingPaymentVerify,
            rejectedPayments,
            pendingReviewAndSubmit,
            submittedToDV
        ] = await Promise.all([
            // 1. Total submitted applications
            prisma.application.count(),

            // 2. Pending payment verify applications (paymentStatus: 'PENDING')
            prisma.application.count({
                where: {
                    paymentStatus: 'PENDING'
                }
            }),


            prisma.application.count({
                where: {
                    paymentStatus: 'REJECTED'
                }
            }),

            // 3. Pending review and submit to DV applications (status: 'PAYMENT_VERIFIED')
            prisma.application.count({
                where: {
                    status: 'PAYMENT_VERIFIED'
                }
            }),

            // 4. Submitted to DV applications
            prisma.application.count({
                where: {
                    status: {
                        in: ['SUBMITTED', 'CONFIRMED']
                    }
                }
            })
        ])

        const statistics = {
            totalSubmittedApplications,
            pendingPaymentVerify,
            rejectedPayments,
            pendingReviewAndSubmit,
            submittedToDV
        }

        return NextResponse.json({
            success: true,
            data: statistics
        })

    } catch (error) {
        console.error('Error fetching statistics:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch statistics'
            },
            { status: 500 }
        )
    }
}