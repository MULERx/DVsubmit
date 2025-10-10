import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { photoStorageService } from '@/lib/services/photo-storage'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { path, expiresIn } = await request.json()

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Photo path is required' },
        { status: 400 }
      )
    }

    // Verify the path belongs to the authenticated user (for security)
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to access this photo' },
        { status: 403 }
      )
    }

    // Get signed URL
    const signedUrlResult = await photoStorageService.getSignedUrl(
      path,
      expiresIn || 3600 // Default 1 hour
    )

    if (!signedUrlResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: signedUrlResult.error || 'Failed to get signed URL' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl: signedUrlResult.data?.signedUrl,
        expiresIn: signedUrlResult.data?.expiresIn
      }
    })

  } catch (error) {
    console.error('Signed URL API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get path from query parameters
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const expiresIn = searchParams.get('expiresIn')

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Photo path is required' },
        { status: 400 }
      )
    }

    // Verify the path belongs to the authenticated user (for security)
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to access this photo' },
        { status: 403 }
      )
    }

    // Get signed URL
    const signedUrlResult = await photoStorageService.getSignedUrl(
      path,
      expiresIn ? parseInt(expiresIn) : 3600 // Default 1 hour
    )

    if (!signedUrlResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: signedUrlResult.error || 'Failed to get signed URL' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl: signedUrlResult.data?.signedUrl,
        expiresIn: signedUrlResult.data?.expiresIn
      }
    })

  } catch (error) {
    console.error('Signed URL API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}