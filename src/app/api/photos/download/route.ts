import { NextRequest, NextResponse } from 'next/server'
import { serverPhotoStorageService } from '@/lib/services/photo-storage'

export async function POST(request: NextRequest) {
  try {
    const { path, filename } = await request.json()

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Photo path is required' },
        { status: 400 }
      )
    }

    // Get signed URL for the photo
    const result = await serverPhotoStorageService.getSignedUrl(path)

    if (!result.success || !result.data?.signedUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate signed URL' 
        },
        { status: 500 }
      )
    }

    // Fetch the image from Supabase storage
    const imageResponse = await fetch(result.data.signedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS-Server/1.0',
      },
    })
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image from storage:', {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        url: result.data.signedUrl
      })
      return NextResponse.json(
        { 
          error: 'Failed to fetch image from storage',
          details: `HTTP ${imageResponse.status}: ${imageResponse.statusText}`
        },
        { status: 500 }
      )
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Ensure we have valid image data
    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Image file is empty' },
        { status: 500 }
      )
    }

    // Return the image with appropriate headers for download
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'photo.jpg'}"`,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('Photo download API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}