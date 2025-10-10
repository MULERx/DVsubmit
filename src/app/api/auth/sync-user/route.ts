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

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      },
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user to database' },
      { status: 500 }
    )
  }
}