import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { supabaseUser } = await request.json()

    if (!supabaseUser || !supabaseUser.email) {
      return NextResponse.json(
        { error: 'Supabase user data with email is required' },
        { status: 400 }
      )
    }

    // Sync user to database
    const dbUser = await authServer.syncUserToDatabase({
      id: supabaseUser.id,
      email: supabaseUser.email,
    })

    // Check if user is blocked after syncing
    if (dbUser.blocked) {
      return NextResponse.json(
        { 
          error: 'Your account has been blocked. Please contact support for assistance.',
          blocked: true,
          blockedAt: dbUser.blockedAt
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      },
    })
  } catch (error) {
    
    // Handle deleted account error specifically
    if (error instanceof Error && error.message.includes('Account has been deleted')) {
      return NextResponse.json(
        { error: 'Account has been deleted and cannot be restored' },
        { status: 403 }
      )
    }

    // Handle blocked account error specifically
    if (error instanceof Error && error.message.includes('blocked')) {
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support for assistance.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to sync user to database' },
      { status: 500 }
    )
  }
}