import { PhotoValidationResult } from '@/lib/types/application'

// DV Photo Requirements Constants
export const DV_PHOTO_REQUIREMENTS = {
  minWidth: 600,
  maxWidth: 1200,
  minHeight: 600,
  maxHeight: 1200,
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png'],
  aspectRatioTolerance: 0.1, // 10% tolerance for square aspect ratio
} as const

/**
 * Validates a photo file against DV lottery requirements
 * @param file The photo file to validate
 * @returns Promise<PhotoValidationResult> Validation result with errors and warnings
 */
export async function validatePhotoFile(file: File): Promise<PhotoValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file size
  if (file.size > DV_PHOTO_REQUIREMENTS.maxSize) {
    errors.push(`File size must be less than ${DV_PHOTO_REQUIREMENTS.maxSize / (1024 * 1024)}MB`)
  }

  // Check file format
  if (!DV_PHOTO_REQUIREMENTS.allowedFormats.includes(file.type as any)) {
    errors.push('Photo must be in JPEG or PNG format')
  }

  // Check image dimensions
  const metadata = await getImageMetadata(file)

  // Check minimum dimensions
  if (metadata.width < DV_PHOTO_REQUIREMENTS.minWidth || metadata.height < DV_PHOTO_REQUIREMENTS.minHeight) {
    errors.push(`Photo must be at least ${DV_PHOTO_REQUIREMENTS.minWidth}x${DV_PHOTO_REQUIREMENTS.minHeight} pixels`)
  }

  // Check maximum dimensions
  if (metadata.width > DV_PHOTO_REQUIREMENTS.maxWidth || metadata.height > DV_PHOTO_REQUIREMENTS.maxHeight) {
    errors.push(`Photo must not exceed ${DV_PHOTO_REQUIREMENTS.maxWidth}x${DV_PHOTO_REQUIREMENTS.maxWidth} pixels`)
  }

  // Check aspect ratio (should be square)
  const aspectRatio = metadata.width / metadata.height
  const isSquare = Math.abs(aspectRatio - 1) <= DV_PHOTO_REQUIREMENTS.aspectRatioTolerance
  
  if (!isSquare) {
    errors.push('Photo must be square (equal width and height)')
  }

  // Add warnings for optimal quality
  if (metadata.width < 800 || metadata.height < 800) {
    warnings.push('For best quality, consider using a photo that is at least 800x800 pixels')
  }

  if (file.size < 100 * 1024) { // Less than 100KB
    warnings.push('Photo file size is quite small. Ensure the image is high quality')
  }

  // Check for common photo issues
  if (file.name.toLowerCase().includes('screenshot')) {
    warnings.push('Screenshots are not recommended. Use a proper photo instead')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata
  }
}

/**
 * Gets metadata from an image file
 * @param file The image file
 * @returns Promise with image metadata
 */
export function getImageMetadata(file: File): Promise<{
  width: number
  height: number
  size: number
  format: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        format: file.type
      })
      URL.revokeObjectURL(img.src)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Creates a preview URL for an image file
 * @param file The image file
 * @returns Preview URL string
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revokes a preview URL to free up memory
 * @param previewUrl The preview URL to revoke
 */
export function revokeImagePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl)
}

/**
 * Formats file size in human readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Checks if a file is a valid image type
 * @param file The file to check
 * @returns boolean indicating if file is a valid image
 */
export function isValidImageType(file: File): boolean {
  return DV_PHOTO_REQUIREMENTS.allowedFormats.includes(file.type as any)
}

/**
 * Gets photo validation error messages for display
 * @param validationResult The validation result
 * @returns Formatted error messages
 */
export function getPhotoValidationMessages(validationResult: PhotoValidationResult): {
  errorMessages: string[]
  warningMessages: string[]
  successMessage?: string
} {
  const errorMessages = validationResult.errors
  const warningMessages = validationResult.warnings
  const successMessage = validationResult.isValid ? 'Photo meets all DV lottery requirements' : undefined

  return {
    errorMessages,
    warningMessages,
    successMessage
  }
}