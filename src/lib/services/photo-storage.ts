import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/server'

export interface PhotoUploadResult {
  success: boolean
  data?: {
    path: string
    publicUrl?: string
    signedUrl?: string
  }
  error?: string
}

export interface PhotoDeleteResult {
  success: boolean
  error?: string
}

export interface SignedUrlResult {
  success: boolean
  data?: {
    signedUrl: string
    expiresIn: number
  }
  error?: string
}

// Storage bucket configuration
export const PHOTO_STORAGE_CONFIG = {
  bucketName: 'dv-photos',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  signedUrlExpirySeconds: 3600, // 1 hour
} as const

/**
 * Client-side photo upload service
 */
export class PhotoStorageService {
  private supabase = createClient()

  /**
   * Uploads a photo file to Supabase Storage
   * @param file The photo file to upload
   * @param userId The user ID for organizing files
   * @param applicationId The application ID for organizing files
   * @returns Upload result with path and URLs
   */
  async uploadPhoto(
    file: File, 
    userId: string, 
    applicationId?: string
  ): Promise<PhotoUploadResult> {
    try {
      // Validate file
      if (!this.isValidFile(file)) {
        return {
          success: false,
          error: 'Invalid file type or size'
        }
      }

      // Generate file path
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const timestamp = Date.now()
      const fileName = `photo_${timestamp}.${fileExtension}`
      
      const filePath = applicationId 
        ? `${userId}/${applicationId}/${fileName}`
        : `${userId}/${fileName}`

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Photo upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      // Get signed URL for immediate viewing
      const signedUrlResult = await this.getSignedUrl(data.path)
      
      return {
        success: true,
        data: {
          path: data.path,
          signedUrl: signedUrlResult.success ? signedUrlResult.data?.signedUrl : undefined
        }
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Gets a signed URL for viewing a photo
   * @param path The storage path of the photo
   * @param expiresIn Expiry time in seconds (default: 1 hour)
   * @returns Signed URL result
   */
  async getSignedUrl(
    path: string, 
    expiresIn: number = PHOTO_STORAGE_CONFIG.signedUrlExpirySeconds
  ): Promise<SignedUrlResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Signed URL error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: {
          signedUrl: data.signedUrl,
          expiresIn
        }
      }
    } catch (error) {
      console.error('Signed URL error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get signed URL'
      }
    }
  }

  /**
   * Deletes a photo from storage
   * @param path The storage path of the photo
   * @returns Delete result
   */
  async deletePhoto(path: string): Promise<PhotoDeleteResult> {
    try {
      const { error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .remove([path])

      if (error) {
        console.error('Photo delete error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Photo delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }

  /**
   * Replaces an existing photo with a new one
   * @param oldPath The path of the existing photo to replace
   * @param newFile The new photo file
   * @param userId The user ID
   * @param applicationId The application ID
   * @returns Upload result
   */
  async replacePhoto(
    oldPath: string,
    newFile: File,
    userId: string,
    applicationId?: string
  ): Promise<PhotoUploadResult> {
    try {
      // Upload new photo first
      const uploadResult = await this.uploadPhoto(newFile, userId, applicationId)
      
      if (!uploadResult.success) {
        return uploadResult
      }

      // Delete old photo (don't fail if this fails)
      await this.deletePhoto(oldPath)

      return uploadResult
    } catch (error) {
      console.error('Photo replace error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Replace failed'
      }
    }
  }

  /**
   * Lists photos for a user
   * @param userId The user ID
   * @param applicationId Optional application ID to filter by
   * @returns List of photo paths
   */
  async listUserPhotos(userId: string, applicationId?: string) {
    try {
      const prefix = applicationId ? `${userId}/${applicationId}/` : `${userId}/`
      
      const { data, error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .list(prefix)

      if (error) {
        console.error('List photos error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      console.error('List photos error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list photos'
      }
    }
  }

  /**
   * Validates if a file meets the storage requirements
   * @param file The file to validate
   * @returns Boolean indicating if file is valid
   */
  private isValidFile(file: File): boolean {
    // Check file size
    if (file.size > PHOTO_STORAGE_CONFIG.maxFileSize) {
      return false
    }

    // Check MIME type
    if (!PHOTO_STORAGE_CONFIG.allowedMimeTypes.includes(file.type as any)) {
      return false
    }

    return true
  }
}

/**
 * Server-side photo storage service with elevated permissions
 */
export class ServerPhotoStorageService {
  private supabase = createServiceClient()

  /**
   * Gets a signed URL using service role (for server-side operations)
   * @param path The storage path
   * @param expiresIn Expiry time in seconds
   * @returns Signed URL result
   */
  async getSignedUrl(
    path: string, 
    expiresIn: number = PHOTO_STORAGE_CONFIG.signedUrlExpirySeconds
  ): Promise<SignedUrlResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Server signed URL error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: {
          signedUrl: data.signedUrl,
          expiresIn
        }
      }
    } catch (error) {
      console.error('Server signed URL error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get signed URL'
      }
    }
  }

  /**
   * Deletes a photo using service role (for admin operations)
   * @param path The storage path
   * @returns Delete result
   */
  async deletePhoto(path: string): Promise<PhotoDeleteResult> {
    try {
      const { error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .remove([path])

      if (error) {
        console.error('Server photo delete error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Server photo delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }

  /**
   * Moves a photo from one location to another (for organizing files)
   * @param fromPath Source path
   * @param toPath Destination path
   * @returns Move result
   */
  async movePhoto(fromPath: string, toPath: string): Promise<PhotoDeleteResult> {
    try {
      const { error } = await this.supabase.storage
        .from(PHOTO_STORAGE_CONFIG.bucketName)
        .move(fromPath, toPath)

      if (error) {
        console.error('Server photo move error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Server photo move error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Move failed'
      }
    }
  }
}

// Export singleton instances
export const photoStorageService = new PhotoStorageService()
export const serverPhotoStorageService = new ServerPhotoStorageService()