import { NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET() {
  try {
    const users = await authServer.getAllUsers()

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Error getting users:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    )
  }
}