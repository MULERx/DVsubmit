import { NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { prisma } from '@/lib/db'

export async function DELETE() {
  try {
    // Get the current user with database info
    const userWithRole = await authServer.getUserWithRole()

    if (!userWithRole?.supabaseUser || !userWithRole?.dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { supabaseUser, dbUser } = userWithRole

    // Create audit log for account deletion BEFORE soft delete
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id, // Use database user ID, not Supabase ID
        action: 'ACCOUNT_DELETED',
        details: {
          deletedAt: new Date().toISOString(),
          originalEmail: supabaseUser.email
        },
        ipAddress: null,
        userAgent: null
      }
    })

    // Soft delete the user in the database
    await prisma.user.update({
      where: {
        id: dbUser.id
      },
      data: {
        deletedAt: new Date(),
      }
    })



    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted'
    })
  } catch (error) {
    console.error('Error deleting account:', error)

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}