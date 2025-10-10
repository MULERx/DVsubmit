import { PhotoValidationResult } from '@/lib/types/application'

export interface AdvancedPhotoValidationResult extends PhotoValidationResult {
  complianceScore: number // 0-100 score
  faceDetection?: {
    faceDetected: boolean
    faceCount: number
    faceCentered: boolean
    eyesOpen: boolean
    neutralExpression: boolean
  }
  backgroundAnalysis?: {
    isPlain: boolean
    backgroundColor: string
    hasPatterns: boolean
    hasShadows: boolean
  }
  qualityAssessment?: {
    sharpness: number // 0-100
    brightness: number // 0-100
    contrast: number // 0-100
    overallQuality: 'poor' | 'fair' | 'good' | 'excellent'
  }
  complianceIssues: string[]
  recommendations: string[]
}

/**
 * Performs advanced photo compliance validation for DV lottery requirements
 * This is a simplified implementation - in production, you would integrate with
 * computer vision services like Google Vision API, AWS Rekognition, or Azure Computer Vision
 */
export async function validateAdvancedPhotoCompliance(file: File): Promise<AdvancedPhotoValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const complianceIssues: string[] = []
  const recommendations: string[] = []

  try {
    // Get image data for analysis
    const imageData = await getImageAnalysisData(file)
    
    // Analyze image properties
    const qualityAssessment = analyzeImageQuality(imageData)
    const backgroundAnalysis = analyzeBackground(imageData)
    const faceDetection = await analyzeFaceCompliance(imageData)

    // Calculate compliance score
    let complianceScore = 100

    // Face detection compliance
    if (!faceDetection.faceDetected) {
      errors.push('No face detected in the photo')
      complianceIssues.push('face_not_detected')
      complianceScore -= 50
    } else {
      if (faceDetection.faceCount > 1) {
        errors.push('Multiple faces detected. Only one person should be in the photo')
        complianceIssues.push('multiple_faces')
        complianceScore -= 30
      }

      if (!faceDetection.faceCentered) {
        warnings.push('Face should be centered in the photo')
        complianceIssues.push('face_not_centered')
        complianceScore -= 10
      }

      if (!faceDetection.eyesOpen) {
        warnings.push('Eyes should be open and clearly visible')
        complianceIssues.push('eyes_not_open')
        complianceScore -= 15
      }

      if (!faceDetection.neutralExpression) {
        warnings.push('Maintain a neutral facial expression')
        complianceIssues.push('non_neutral_expression')
        complianceScore -= 10
      }
    }

    // Background compliance
    if (!backgroundAnalysis.isPlain) {
      warnings.push('Background should be plain and neutral')
      complianceIssues.push('complex_background')
      complianceScore -= 15
    }

    if (backgroundAnalysis.hasShadows) {
      warnings.push('Avoid shadows on face or background')
      complianceIssues.push('shadows_detected')
      complianceScore -= 10
    }

    // Quality assessment
    if (qualityAssessment.sharpness < 70) {
      warnings.push('Photo appears blurry. Use a sharper image')
      complianceIssues.push('low_sharpness')
      complianceScore -= 15
    }

    if (qualityAssessment.brightness < 40 || qualityAssessment.brightness > 80) {
      warnings.push('Photo lighting should be even and natural')
      complianceIssues.push('poor_lighting')
      complianceScore -= 10
    }

    if (qualityAssessment.contrast < 50) {
      warnings.push('Photo has low contrast. Ensure good lighting')
      complianceIssues.push('low_contrast')
      complianceScore -= 10
    }

    // Generate recommendations
    if (complianceScore < 90) {
      recommendations.push('Consider retaking the photo with better lighting')
    }
    if (!backgroundAnalysis.isPlain) {
      recommendations.push('Use a plain white or light-colored background')
    }
    if (qualityAssessment.sharpness < 70) {
      recommendations.push('Ensure the camera is steady and in focus')
    }
    if (!faceDetection.faceCentered) {
      recommendations.push('Center your face in the frame')
    }

    // Ensure minimum compliance score
    complianceScore = Math.max(0, complianceScore)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceScore,
      faceDetection,
      backgroundAnalysis,
      qualityAssessment,
      complianceIssues,
      recommendations,
      metadata: {
        width: imageData.width,
        height: imageData.height,
        size: file.size,
        format: file.type
      }
    }

  } catch (error) {
    console.error('Advanced photo validation error:', error)
    return {
      isValid: false,
      errors: ['Failed to analyze photo. Please try again with a different image.'],
      warnings: [],
      complianceScore: 0,
      complianceIssues: ['analysis_failed'],
      recommendations: ['Try uploading a different photo'],
      metadata: {
        width: 0,
        height: 0,
        size: file.size,
        format: file.type
      }
    }
  }
}

/**
 * Gets image data for analysis
 */
async function getImageAnalysisData(file: File): Promise<{
  width: number
  height: number
  imageData: ImageData
  canvas: HTMLCanvasElement
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      
      resolve({
        width: img.width,
        height: img.height,
        imageData,
        canvas
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
 * Analyzes image quality metrics
 */
function analyzeImageQuality(data: { imageData: ImageData }): {
  sharpness: number
  brightness: number
  contrast: number
  overallQuality: 'poor' | 'fair' | 'good' | 'excellent'
} {
  const { imageData } = data
  const pixels = imageData.data

  // Calculate brightness
  let totalBrightness = 0
  let minBrightness = 255
  let maxBrightness = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const brightness = (r + g + b) / 3

    totalBrightness += brightness
    minBrightness = Math.min(minBrightness, brightness)
    maxBrightness = Math.max(maxBrightness, brightness)
  }

  const avgBrightness = totalBrightness / (pixels.length / 4)
  const brightness = (avgBrightness / 255) * 100

  // Calculate contrast
  const contrast = ((maxBrightness - minBrightness) / 255) * 100

  // Estimate sharpness using edge detection
  const sharpness = estimateSharpness(imageData)

  // Determine overall quality
  let overallQuality: 'poor' | 'fair' | 'good' | 'excellent'
  const qualityScore = (sharpness + Math.min(brightness, 100 - brightness) + contrast) / 3

  if (qualityScore >= 80) overallQuality = 'excellent'
  else if (qualityScore >= 65) overallQuality = 'good'
  else if (qualityScore >= 50) overallQuality = 'fair'
  else overallQuality = 'poor'

  return {
    sharpness,
    brightness,
    contrast,
    overallQuality
  }
}

/**
 * Estimates image sharpness using Laplacian edge detection
 */
function estimateSharpness(imageData: ImageData): number {
  const { width, height, data } = imageData
  let sharpnessSum = 0
  let pixelCount = 0

  // Laplacian kernel for edge detection
  const kernel = [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0]
  ]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let laplacian = 0

      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const pixelY = y + ky - 1
          const pixelX = x + kx - 1
          const pixelIndex = (pixelY * width + pixelX) * 4
          
          // Use grayscale value
          const gray = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3
          laplacian += gray * kernel[ky][kx]
        }
      }

      sharpnessSum += Math.abs(laplacian)
      pixelCount++
    }
  }

  const avgSharpness = sharpnessSum / pixelCount
  return Math.min(100, (avgSharpness / 50) * 100) // Normalize to 0-100
}

/**
 * Analyzes background properties
 */
function analyzeBackground(data: { imageData: ImageData }): {
  isPlain: boolean
  backgroundColor: string
  hasPatterns: boolean
  hasShadows: boolean
} {
  const { imageData } = data
  const pixels = imageData.data
  const { width, height } = imageData

  // Sample background pixels (edges of the image)
  const backgroundPixels: number[] = []
  
  // Top and bottom edges
  for (let x = 0; x < width; x++) {
    // Top edge
    const topIndex = x * 4
    const topGray = (pixels[topIndex] + pixels[topIndex + 1] + pixels[topIndex + 2]) / 3
    backgroundPixels.push(topGray)
    
    // Bottom edge
    const bottomIndex = ((height - 1) * width + x) * 4
    const bottomGray = (pixels[bottomIndex] + pixels[bottomIndex + 1] + pixels[bottomIndex + 2]) / 3
    backgroundPixels.push(bottomGray)
  }

  // Left and right edges
  for (let y = 0; y < height; y++) {
    // Left edge
    const leftIndex = (y * width) * 4
    const leftGray = (pixels[leftIndex] + pixels[leftIndex + 1] + pixels[leftIndex + 2]) / 3
    backgroundPixels.push(leftGray)
    
    // Right edge
    const rightIndex = (y * width + width - 1) * 4
    const rightGray = (pixels[rightIndex] + pixels[rightIndex + 1] + pixels[rightIndex + 2]) / 3
    backgroundPixels.push(rightGray)
  }

  // Calculate background statistics
  const avgBackground = backgroundPixels.reduce((sum, val) => sum + val, 0) / backgroundPixels.length
  const backgroundVariance = backgroundPixels.reduce((sum, val) => sum + Math.pow(val - avgBackground, 2), 0) / backgroundPixels.length
  const backgroundStdDev = Math.sqrt(backgroundVariance)

  // Determine if background is plain (low variance)
  const isPlain = backgroundStdDev < 20

  // Estimate background color
  const backgroundColor = avgBackground > 200 ? 'light' : avgBackground > 100 ? 'medium' : 'dark'

  // Check for patterns (high frequency variations)
  const hasPatterns = backgroundStdDev > 30

  // Check for shadows (gradient in background)
  const hasShadows = backgroundStdDev > 15 && backgroundStdDev < 30

  return {
    isPlain,
    backgroundColor,
    hasPatterns,
    hasShadows
  }
}

/**
 * Simplified face compliance analysis
 * In production, this would use a computer vision API
 */
async function analyzeFaceCompliance(data: { imageData: ImageData }): Promise<{
  faceDetected: boolean
  faceCount: number
  faceCentered: boolean
  eyesOpen: boolean
  neutralExpression: boolean
}> {
  // This is a simplified mock implementation
  // In production, you would use services like:
  // - Google Vision API
  // - AWS Rekognition
  // - Azure Computer Vision
  // - Face++ API

  const { imageData } = data
  const { width, height } = imageData

  // Mock face detection based on image characteristics
  const centerRegion = getCenterRegion(imageData, 0.4) // 40% of center area
  const faceDetected = await mockFaceDetection(centerRegion)

  return {
    faceDetected: faceDetected.detected,
    faceCount: faceDetected.count,
    faceCentered: faceDetected.centered,
    eyesOpen: faceDetected.eyesOpen,
    neutralExpression: faceDetected.neutralExpression
  }
}

/**
 * Gets the center region of an image
 */
function getCenterRegion(imageData: ImageData, ratio: number): ImageData {
  const { width, height, data } = imageData
  const centerWidth = Math.floor(width * ratio)
  const centerHeight = Math.floor(height * ratio)
  const startX = Math.floor((width - centerWidth) / 2)
  const startY = Math.floor((height - centerHeight) / 2)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = centerWidth
  canvas.height = centerHeight

  const centerData = ctx.createImageData(centerWidth, centerHeight)
  
  for (let y = 0; y < centerHeight; y++) {
    for (let x = 0; x < centerWidth; x++) {
      const sourceIndex = ((startY + y) * width + (startX + x)) * 4
      const targetIndex = (y * centerWidth + x) * 4
      
      centerData.data[targetIndex] = data[sourceIndex]
      centerData.data[targetIndex + 1] = data[sourceIndex + 1]
      centerData.data[targetIndex + 2] = data[sourceIndex + 2]
      centerData.data[targetIndex + 3] = data[sourceIndex + 3]
    }
  }

  return centerData
}

/**
 * Mock face detection - in production, use a real computer vision API
 */
async function mockFaceDetection(imageData: ImageData): Promise<{
  detected: boolean
  count: number
  centered: boolean
  eyesOpen: boolean
  neutralExpression: boolean
}> {
  // This is a simplified mock that analyzes basic image properties
  // In production, replace with actual face detection API calls

  const pixels = imageData.data
  let skinTonePixels = 0
  let darkPixels = 0
  let totalPixels = pixels.length / 4

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]

    // Simple skin tone detection (very basic)
    if (r > 95 && g > 40 && b > 20 && 
        r > g && r > b && 
        Math.abs(r - g) > 15) {
      skinTonePixels++
    }

    // Dark pixel detection (for eyes/hair)
    if (r < 50 && g < 50 && b < 50) {
      darkPixels++
    }
  }

  const skinToneRatio = skinTonePixels / totalPixels
  const darkPixelRatio = darkPixels / totalPixels

  // Mock detection based on ratios
  const detected = skinToneRatio > 0.1 && darkPixelRatio > 0.05
  const count = detected ? 1 : 0
  const centered = detected // Assume centered if detected in center region
  const eyesOpen = darkPixelRatio > 0.02 // Assume eyes open if enough dark pixels
  const neutralExpression = true // Mock as true

  return {
    detected,
    count,
    centered,
    eyesOpen,
    neutralExpression
  }
}