import { NextRequest, NextResponse } from 'next/server'
import { serverPhotoStorageService } from '@/lib/services/photo-storage'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Photo path is required' },
        { status: 400 }
      )
    }

    // Generate signed URL for the photo
    const result = await serverPhotoStorageService.getSignedUrl(path)

    if (!result.success) {
      // Check if it's a "not found" error
      const isNotFound = result.error?.includes('Object not found') || result.error?.includes('not found')
      
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate signed URL' 
        },
        { status: isNotFound ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.data?.signedUrl,
      expiresIn: result.data?.expiresIn
    })

  } catch (error) {
    console.error('Signed URL API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}