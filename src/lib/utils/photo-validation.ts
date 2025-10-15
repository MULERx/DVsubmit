/* eslint-disable @typescript-eslint/no-explicit-any */
import { PhotoValidationResult } from "@/lib/types/application";

// DV Photo Requirements Constants
export const DV_PHOTO_REQUIREMENTS = {
  minWidth: 600,
  maxWidth: 1200,
  minHeight: 600,
  maxHeight: 1200,
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ["image/jpeg", "image/jpg", "image/png"],
  aspectRatioTolerance: 0.1, // 10% tolerance for square aspect ratio
} as const;

/**
 * Validates a photo file against DV lottery requirements
 * @param file The photo file to validate
 * @returns Promise<PhotoValidationResult> Validation result with errors and warnings
 */
export async function validatePhotoFile(
  file: File
): Promise<PhotoValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (file.size > DV_PHOTO_REQUIREMENTS.maxSize) {
    errors.push(
      `File size must be less than ${
        DV_PHOTO_REQUIREMENTS.maxSize / (1024 * 1024)
      }MB`
    );
  }

  // Check file format
  if (!DV_PHOTO_REQUIREMENTS.allowedFormats.includes(file.type as any)) {
    errors.push("Photo must be in JPEG or PNG format");
  }

  // Check image dimensions
  const metadata = await getImageMetadata(file);

  // Check minimum dimensions
  if (
    metadata.width < DV_PHOTO_REQUIREMENTS.minWidth ||
    metadata.height < DV_PHOTO_REQUIREMENTS.minHeight
  ) {
    errors.push(
      `Photo must be at least ${DV_PHOTO_REQUIREMENTS.minWidth}x${DV_PHOTO_REQUIREMENTS.minHeight} pixels`
    );
  }

  // Check maximum dimensions
  if (
    metadata.width > DV_PHOTO_REQUIREMENTS.maxWidth ||
    metadata.height > DV_PHOTO_REQUIREMENTS.maxHeight
  ) {
    errors.push(
      `Photo must not exceed ${DV_PHOTO_REQUIREMENTS.maxWidth}x${DV_PHOTO_REQUIREMENTS.maxWidth} pixels`
    );
  }

  // Check aspect ratio (should be square)
  const aspectRatio = metadata.width / metadata.height;
  const isSquare =
    Math.abs(aspectRatio - 1) <= DV_PHOTO_REQUIREMENTS.aspectRatioTolerance;

  if (!isSquare) {
    errors.push("Photo must be square (equal width and height)");
  }

  // Add warnings for optimal quality
  if (metadata.width < 800 || metadata.height < 800) {
    warnings.push(
      "For best quality, consider using a photo that is at least 800x800 pixels"
    );
  }

  if (file.size < 100 * 1024) {
    // Less than 100KB
    warnings.push(
      "Photo file size is quite small. Ensure the image is high quality"
    );
  }

  // Check for common photo issues
  if (file.name.toLowerCase().includes("screenshot")) {
    warnings.push(
      "Screenshots are not recommended. Use a proper photo instead"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}

/**
 * Gets metadata from an image file
 * @param file The image file
 * @returns Promise with image metadata
 */
export function getImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  format: string;
}> {
  // Check if we're in a browser environment
  if (typeof window !== "undefined" && typeof Image !== "undefined") {
    // Browser environment - use Image constructor
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.type,
        });
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  } else {
    // Server environment - use a different approach
    return getImageMetadataServer(file);
  }
}

/**
 * Server-side image metadata extraction
 * @param file The image file
 * @returns Promise with image metadata
 */
async function getImageMetadataServer(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  format: string;
}> {
  try {
    // For server-side, we'll use a basic approach with image-size library
    // First, let's try to read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try to extract dimensions using a simple approach
    // This is a basic implementation - for production, consider using 'image-size' npm package
    const dimensions = await extractImageDimensions(buffer, file.type);

    return {
      width: dimensions.width,
      height: dimensions.height,
      size: file.size,
      format: file.type,
    };
  } catch (error) {
    console.error("Server-side image metadata extraction failed:", error);
    // Fallback: return basic info without dimensions
    return {
      width: 0,
      height: 0,
      size: file.size,
      format: file.type,
    };
  }
}

/**
 * Basic image dimension extraction from buffer
 * @param buffer Image buffer
 * @param mimeType Image MIME type
 * @returns Promise with width and height
 */
async function extractImageDimensions(
  buffer: Buffer,
  mimeType: string
): Promise<{ width: number; height: number }> {
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return extractJPEGDimensions(buffer);
  } else if (mimeType === "image/png") {
    return extractPNGDimensions(buffer);
  } else {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }
}

/**
 * Extract dimensions from JPEG buffer
 */
function extractJPEGDimensions(buffer: Buffer): {
  width: number;
  height: number;
} {
  let i = 0;

  // Check for JPEG signature
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Invalid JPEG file");
  }

  i = 2;

  while (i < buffer.length) {
    // Find next marker
    if (buffer[i] !== 0xff) {
      i++;
      continue;
    }

    const marker = buffer[i + 1];

    // SOF markers (Start of Frame)
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = (buffer[i + 5] << 8) | buffer[i + 6];
      const width = (buffer[i + 7] << 8) | buffer[i + 8];

      return { width, height };
    }

    // Skip this segment
    const segmentLength = (buffer[i + 2] << 8) | buffer[i + 3];
    i += 2 + segmentLength;
  }

  throw new Error("Could not find JPEG dimensions");
}

/**
 * Extract dimensions from PNG buffer
 */
function extractPNGDimensions(buffer: Buffer): {
  width: number;
  height: number;
} {
  // Check PNG signature
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error("Invalid PNG file");
  }

  // IHDR chunk starts at byte 8
  // Width is at bytes 16-19, height at bytes 20-23
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

/**
 * Creates a preview URL for an image file
 * @param file The image file
 * @returns Preview URL string
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a preview URL to free up memory
 * @param previewUrl The preview URL to revoke
 */
export function revokeImagePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl);
}

/**
 * Formats file size in human readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Checks if a file is a valid image type
 * @param file The file to check
 * @returns boolean indicating if file is a valid image
 */
export function isValidImageType(file: File): boolean {
  return DV_PHOTO_REQUIREMENTS.allowedFormats.includes(file.type as any);
}

/**
 * Gets photo validation error messages for display
 * @param validationResult The validation result
 * @returns Formatted error messages
 */
export function getPhotoValidationMessages(
  validationResult: PhotoValidationResult
): {
  errorMessages: string[];
  warningMessages: string[];
  successMessage?: string;
} {
  const errorMessages = validationResult.errors;
  const warningMessages = validationResult.warnings;
  const successMessage = validationResult.isValid
    ? "Photo meets all DV lottery requirements"
    : undefined;

  return {
    errorMessages,
    warningMessages,
    successMessage,
  };
}
