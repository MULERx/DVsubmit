import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serverPhotoStorageService } from '@/lib/services/photo-storage'
import { validatePhotoFileServer } from '@/lib/utils/photo-validation-server'

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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const applicationId = formData.get('applicationId') as string | null

    if (!file) {
      console.error('No photo file provided in FormData')
      return NextResponse.json(
        { success: false, error: 'No photo file provided' },
        { status: 400 }
      )
    }

    // Perform basic validation first using server-side validation
    const basicValidation = await validatePhotoFileServer(file)

    if (!basicValidation.isValid) {
      console.error('Photo validation failed:', basicValidation.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'Photo validation failed',
          details: {
            errors: basicValidation.errors,
            warnings: basicValidation.warnings,
            validationType: 'basic'
          }
        },
        { status: 400 }
      )
    }


    // Upload photo to Supabase Storage using server-side service
    const uploadResult = await serverPhotoStorageService.uploadPhoto(
      file,
      user.id,
      applicationId || undefined
    )

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error || 'Upload failed'
        },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        path: uploadResult.data?.path,
        signedUrl: uploadResult.data?.signedUrl,
        validation: {
          basic: {
            isValid: basicValidation.isValid,
            warnings: basicValidation.warnings,
            metadata: basicValidation.metadata
          },
        }
      }
    })

  } catch (error) {
    console.error('Photo upload API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Photo path is required' },
        { status: 400 }
      )
    }

    // Verify the path belongs to the authenticated user
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this photo' },
        { status: 403 }
      )
    }

    // Delete photo from storage using server-side service
    const deleteResult = await serverPhotoStorageService.deletePhoto(path)

    if (!deleteResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: deleteResult.error || 'Delete failed'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    })

  } catch (error) {
    console.error('Photo delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}