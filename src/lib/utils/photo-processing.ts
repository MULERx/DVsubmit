/**
 * Photo processing utilities for optimization and compliance
 */

export interface PhotoProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1 for JPEG quality
  format?: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio?: boolean
}

export interface ProcessingResult {
  success: boolean
  processedFile?: File
  originalSize: number
  processedSize: number
  compressionRatio: number
  error?: string
}

/**
 * Processes and optimizes a photo file
 */
export async function processPhoto(
  file: File,
  options: PhotoProcessingOptions = {}
): Promise<ProcessingResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.9,
    format = 'jpeg',
    maintainAspectRatio = true
  } = options

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Load the image
    const img = await loadImage(file)
    
    // Calculate new dimensions
    const { width: newWidth, height: newHeight } = calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight,
      maintainAspectRatio
    )

    // Set canvas dimensions
    canvas.width = newWidth
    canvas.height = newHeight

    // Draw and resize image
    ctx.drawImage(img, 0, 0, newWidth, newHeight)

    // Convert to blob
    const mimeType = `image/${format}`
    const blob = await canvasToBlob(canvas, mimeType, quality)
    
    if (!blob) {
      throw new Error('Failed to process image')
    }

    // Create new file
    const processedFile = new File(
      [blob],
      `processed_${file.name.replace(/\.[^/.]+$/, `.${format}`)}`,
      { type: mimeType }
    )

    const compressionRatio = file.size / blob.size

    return {
      success: true,
      processedFile,
      originalSize: file.size,
      processedSize: blob.size,
      compressionRatio
    }

  } catch (error) {
    console.error('Photo processing error:', error)
    return {
      success: false,
      originalSize: file.size,
      processedSize: 0,
      compressionRatio: 1,
      error: error instanceof Error ? error.message : 'Processing failed'
    }
  }
}

/**
 * Loads an image file and returns an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve(img)
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
 * Calculates optimal dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return { width: maxWidth, height: maxHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  let newWidth = originalWidth
  let newHeight = originalHeight

  // Scale down if necessary
  if (newWidth > maxWidth) {
    newWidth = maxWidth
    newHeight = newWidth / aspectRatio
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = newHeight * aspectRatio
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  }
}

/**
 * Converts canvas to blob with specified format and quality
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality)
  })
}

/**
 * Automatically optimizes a photo for DV lottery requirements
 */
export async function optimizeForDV(file: File): Promise<ProcessingResult> {
  // DV-specific optimization settings
  const options: PhotoProcessingOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85, // Good quality while keeping file size reasonable
    format: 'jpeg',
    maintainAspectRatio: true
  }

  return processPhoto(file, options)
}

/**
 * Creates a thumbnail version of the photo
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<ProcessingResult> {
  const options: PhotoProcessingOptions = {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
    format: 'jpeg',
    maintainAspectRatio: true
  }

  return processPhoto(file, options)
}

/**
 * Enhances photo quality (basic adjustments)
 */
export async function enhancePhoto(
  file: File,
  adjustments: {
    brightness?: number // -100 to 100
    contrast?: number // -100 to 100
    saturation?: number // -100 to 100
  } = {}
): Promise<ProcessingResult> {
  const {
    brightness = 0,
    contrast = 0,
    saturation = 0
  } = adjustments

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    const img = await loadImage(file)
    
    canvas.width = img.width
    canvas.height = img.height

    // Apply filters
    let filterString = ''
    
    if (brightness !== 0) {
      filterString += `brightness(${100 + brightness}%) `
    }
    
    if (contrast !== 0) {
      filterString += `contrast(${100 + contrast}%) `
    }
    
    if (saturation !== 0) {
      filterString += `saturate(${100 + saturation}%) `
    }

    ctx.filter = filterString.trim() || 'none'
    ctx.drawImage(img, 0, 0)

    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9)
    
    if (!blob) {
      throw new Error('Failed to enhance image')
    }

    const enhancedFile = new File(
      [blob],
      `enhanced_${file.name}`,
      { type: 'image/jpeg' }
    )

    return {
      success: true,
      processedFile: enhancedFile,
      originalSize: file.size,
      processedSize: blob.size,
      compressionRatio: file.size / blob.size
    }

  } catch (error) {
    console.error('Photo enhancement error:', error)
    return {
      success: false,
      originalSize: file.size,
      processedSize: 0,
      compressionRatio: 1,
      error: error instanceof Error ? error.message : 'Enhancement failed'
    }
  }
}

/**
 * Checks if a photo needs processing based on DV requirements
 */
export function needsProcessing(file: File, metadata: {
  width: number
  height: number
  size: number
  format: string
}): {
  needsResize: boolean
  needsCompression: boolean
  needsFormatChange: boolean
  recommendations: string[]
} {
  const recommendations: string[] = []
  
  const needsResize = metadata.width > 1200 || metadata.height > 1200
  const needsCompression = file.size > 2 * 1024 * 1024 // 2MB threshold
  const needsFormatChange = !['image/jpeg', 'image/jpg'].includes(file.type)

  if (needsResize) {
    recommendations.push('Resize image to maximum 1200x1200 pixels')
  }
  
  if (needsCompression) {
    recommendations.push('Compress image to reduce file size')
  }
  
  if (needsFormatChange) {
    recommendations.push('Convert to JPEG format for better compatibility')
  }

  return {
    needsResize,
    needsCompression,
    needsFormatChange,
    recommendations
  }
}