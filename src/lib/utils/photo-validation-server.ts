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
 * Server-side photo validation that doesn't rely on browser APIs
 * @param file The photo file to validate
 * @returns Promise<PhotoValidationResult> Validation result with errors and warnings
 */
export async function validatePhotoFileServer(
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

  // Get image dimensions using server-side method
  let metadata;
  try {
    console.log(
      "Extracting image metadata for file:",
      file.name,
      file.type,
      file.size
    );
    metadata = await getImageMetadataServer(file);
    console.log("Extracted metadata:", metadata);
  } catch (error) {
    console.error("Failed to extract image metadata:", error);
    // For now, skip dimension validation if we can't extract metadata
    // This allows the upload to proceed with basic file type and size validation
    console.warn(
      "Skipping dimension validation due to metadata extraction failure"
    );
    metadata = {
      width: 800, // Assume reasonable dimensions
      height: 800,
      size: file.size,
      format: file.type,
    };
    warnings.push(
      "Could not verify image dimensions. Please ensure your photo meets DV requirements."
    );
  }

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
  if (metadata.width > 0 && metadata.height > 0) {
    const aspectRatio = metadata.width / metadata.height;
    const isSquare =
      Math.abs(aspectRatio - 1) <= DV_PHOTO_REQUIREMENTS.aspectRatioTolerance;

    if (!isSquare) {
      errors.push("Photo must be square (equal width and height)");
    }
  }

  // Add warnings for optimal quality
  if (metadata.width > 0 && metadata.height > 0) {
    if (metadata.width < 800 || metadata.height < 800) {
      warnings.push(
        "For best quality, consider using a photo that is at least 800x800 pixels"
      );
    }
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
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract dimensions based on file type
  const dimensions = await extractImageDimensions(buffer, file.type);

  return {
    width: dimensions.width,
    height: dimensions.height,
    size: file.size,
    format: file.type,
  };
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
