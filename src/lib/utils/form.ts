import { UseFormReturn } from 'react-hook-form'

/**
 * Get form field error message
 */
export function getFieldError(
  form: UseFormReturn<Record<string, unknown>>,
  fieldName: string
): string | undefined {
  const error = form.formState.errors[fieldName]
  return error?.message as string | undefined
}

/**
 * Check if form field has error
 */
export function hasFieldError(
  form: UseFormReturn<Record<string, unknown>>,
  fieldName: string
): boolean {
  return !!form.formState.errors[fieldName]
}

/**
 * Get form field props for consistent styling
 */
export function getFieldProps(
  form: UseFormReturn<Record<string, unknown>>,
  fieldName: string
) {
  return {
    ...form.register(fieldName),
    error: hasFieldError(form, fieldName),
    helperText: getFieldError(form, fieldName),
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * Create file validation error message
 */
export function getFileValidationError(
  file: File,
  allowedTypes: string[],
  maxSize: number
): string | null {
  if (!isValidFileType(file, allowedTypes)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
  }
  
  if (!isValidFileSize(file, maxSize)) {
    return `File size too large. Maximum size: ${formatFileSize(maxSize)}`
  }
  
  return null
}

/**
 * Auto-save form data to localStorage
 */
export function saveFormData(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save form data:', error)
  }
}

/**
 * Load form data from localStorage
 */
export function loadFormData<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Failed to load form data:', error)
    return null
  }
}

/**
 * Clear form data from localStorage
 */
export function clearFormData(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear form data:', error)
  }
}