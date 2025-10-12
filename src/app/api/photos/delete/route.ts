import { NextRequest, NextResponse } from 'next/server'
import { serverPhotoStorageService } from '@/lib/services/photo-storage'

export async function DELETE(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Photo path is required' },
        { status: 400 }
      )
    }

    // Delete the photo from storage
    const result = await serverPhotoStorageService.deletePhoto(path)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    })

  } catch (error) {
    console.error('Delete photo API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}