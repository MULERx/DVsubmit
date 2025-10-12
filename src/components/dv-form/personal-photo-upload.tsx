'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Check, AlertTriangle, Image as ImageIcon, Cloud } from 'lucide-react'
import { PhotoValidationResult } from '@/lib/types/application'
import {
  validatePhotoFile,
  createImagePreview,
  revokeImagePreview,
  formatFileSize,
  DV_PHOTO_REQUIREMENTS
} from '@/lib/utils/photo-validation'
import { useSignedUrl, usePhotoUpload, usePhotoDelete } from '@/hooks/use-photo-queries'

interface PersonalPhotoUploadProps {
  onPhotoChange: (data: { file: File; preview: string; path?: string; signedUrl?: string } | null) => void
  initialData?: { file: File; preview: string; path?: string; signedUrl?: string }
  applicationId?: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
}

export function PersonalPhotoUpload({
  onPhotoChange,
  initialData,
  applicationId,
  label,
  description,
  required = false,
  disabled = false
}: PersonalPhotoUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialData?.file || null)
  const [preview, setPreview] = useState<string>(initialData?.signedUrl || initialData?.preview || '')
  const [validation, setValidation] = useState<PhotoValidationResult | null>(
    initialData?.file ? { isValid: true, errors: [], warnings: [] } : null
  )
  const [isValidating, setIsValidating] = useState(false)
  const [storagePath, setStoragePath] = useState<string | undefined>(initialData?.path)
  const [signedUrl, setSignedUrl] = useState<string | undefined>(initialData?.signedUrl)
  const [isExistingPhoto, setIsExistingPhoto] = useState<boolean>(!!initialData?.path)

  // Debug logging for children photos
  useEffect(() => {
    if (label.includes('Child') && initialData) {
      console.log(`${label} - Initial data:`, initialData)
      console.log(`${label} - Storage path:`, storagePath)
      console.log(`${label} - Is existing photo:`, isExistingPhoto)
    }
  }, [label, initialData, storagePath, isExistingPhoto])

  // Handle when initialData changes (for async loading)
  useEffect(() => {
    if (initialData && initialData.file !== uploadedFile) {
      setUploadedFile(initialData.file)
      setPreview(initialData.signedUrl || initialData.preview || '')
      setStoragePath(initialData.path)
      setSignedUrl(initialData.signedUrl)
      setIsExistingPhoto(!!initialData.path)
      if (initialData.file) {
        setValidation({ isValid: true, errors: [], warnings: [] })
      }
    }
  }, [initialData, uploadedFile])
  const [imageMetadata, setImageMetadata] = useState<{ width?: number; height?: number; size?: number } | null>(null)

  // TanStack Query hooks
  const photoUploadMutation = usePhotoUpload()
  const photoDeleteMutation = usePhotoDelete()
  const {
    data: signedUrlData,
    isLoading: isLoadingSignedUrl,
    error: signedUrlError
  } = useSignedUrl(storagePath, !!storagePath && !signedUrl && !!uploadedFile)

  const validatePhoto = useCallback(async (file: File): Promise<PhotoValidationResult> => {
    return await validatePhotoFile(file)
  }, [])

  const getImageMetadata = useCallback((imageUrl: string): Promise<{ width: number; height: number; size?: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      img.src = imageUrl
    })
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return
    
    const file = acceptedFiles[0]
    if (!file) return

    setIsValidating(true)
    
    const previousPhotoPath = storagePath

    setUploadedFile(file)
    setIsExistingPhoto(false)
    setImageMetadata(null)

    const previewUrl = createImagePreview(file)
    setPreview(previewUrl)

    try {
      const validationResult = await validatePhoto(file)
      setValidation(validationResult)

      if (validationResult.isValid) {
        const formData = new FormData()
        formData.append('photo', file)
        if (applicationId) {
          formData.append('applicationId', applicationId)
        }

        const result = await photoUploadMutation.mutateAsync(formData)

        if (result.success && result.data) {
          if (previousPhotoPath && previousPhotoPath !== result.data.path) {
            try {
              await photoDeleteMutation.mutateAsync(previousPhotoPath)
            } catch (deleteError) {
              console.error('Failed to delete previous photo:', deleteError)
            }
          }

          setStoragePath(result.data.path)
          setSignedUrl(result.data.signedUrl)
          if (result.data.signedUrl) {
            setPreview(result.data.signedUrl)
          }

          // Notify parent component
          onPhotoChange({
            file,
            preview: result.data.signedUrl || previewUrl,
            path: result.data.path,
            signedUrl: result.data.signedUrl
          })
        }
      } else {
        // Notify parent component of invalid photo
        onPhotoChange(null)
      }
    } catch (error) {
      setValidation({
        isValid: false,
        errors: ['Failed to validate photo. Please try again.'],
        warnings: []
      })
      onPhotoChange(null)
    } finally {
      setIsValidating(false)
    }
  }, [validatePhoto, photoUploadMutation, photoDeleteMutation, applicationId, storagePath, disabled, onPhotoChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: DV_PHOTO_REQUIREMENTS.maxSize,
    disabled,
    onDropRejected: (fileRejections) => {
      const errors = fileRejections[0]?.errors.map(error => {
        switch (error.code) {
          case 'file-too-large':
            return `File is too large. Maximum size is ${DV_PHOTO_REQUIREMENTS.maxSize / (1024 * 1024)}MB`
          case 'file-invalid-type':
            return 'Invalid file type. Please upload a JPEG or PNG image'
          case 'too-many-files':
            return 'Please upload only one photo'
          default:
            return error.message
        }
      }) || ['Invalid file']

      setValidation({
        isValid: false,
        errors,
        warnings: []
      })
      onPhotoChange(null)
    }
  })

  const removePhoto = useCallback(async () => {
    const pathToDelete = storagePath
    
    setUploadedFile(null)
    setPreview('')
    setValidation(null)
    setStoragePath(undefined)
    setSignedUrl(undefined)
    setIsExistingPhoto(false)
    setImageMetadata(null)

    if (preview) {
      revokeImagePreview(preview)
    }

    // Notify parent component
    onPhotoChange(null)

    try {
      if (pathToDelete) {
        await photoDeleteMutation.mutateAsync(pathToDelete)
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }, [storagePath, preview, photoDeleteMutation, onPhotoChange])

  // Handle signed URL data from TanStack Query
  useEffect(() => {
    if (signedUrlData?.success && signedUrlData.signedUrl && signedUrlData.signedUrl !== '') {
      setSignedUrl(signedUrlData.signedUrl)
      setPreview(signedUrlData.signedUrl)

      const fetchMetadata = async () => {
        try {
          const metadata = await getImageMetadata(signedUrlData.signedUrl!)
          setImageMetadata(metadata)
        } catch (error) {
          console.error('Error getting image metadata:', error)
        }
      }

      fetchMetadata()

      // Notify parent component (for both new uploads and existing photos)
      if (uploadedFile || isExistingPhoto) {
        onPhotoChange({
          file: uploadedFile || new File([], 'existing-photo.jpg'),
          preview: signedUrlData.signedUrl,
          path: storagePath,
          signedUrl: signedUrlData.signedUrl
        })
      }
    }
  }, [signedUrlData, getImageMetadata, uploadedFile, storagePath, onPhotoChange])

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        revokeImagePreview(preview)
      }
    }
  }, [preview])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop photo here' : 'Upload photo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG or PNG, max 5MB, square format
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                {preview ? (
                  <img
                    src={signedUrl || preview}
                    alt={label}
                    className="w-24 h-24 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5"
                    onClick={removePhoto}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isExistingPhoto ? 'Existing Photo' : uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isExistingPhoto ? 'Previously uploaded' : formatFileSize(uploadedFile.size)}
                  </p>
                  {validation?.metadata && (
                    <p className="text-xs text-gray-500">
                      {validation.metadata.width} × {validation.metadata.height} pixels
                    </p>
                  )}
                  {isExistingPhoto && imageMetadata && (
                    <p className="text-xs text-gray-500">
                      {imageMetadata.width} × {imageMetadata.height} pixels
                    </p>
                  )}
                </div>

                {(isValidating || photoUploadMutation.isPending || photoDeleteMutation.isPending || isLoadingSignedUrl) && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span className="text-xs">
                      {isValidating
                        ? 'Validating...'
                        : photoUploadMutation.isPending
                          ? 'Uploading...'
                          : photoDeleteMutation.isPending
                            ? 'Deleting...'
                            : 'Loading...'
                      }
                    </span>
                  </div>
                )}

                {(photoUploadMutation.error || photoDeleteMutation.error || signedUrlError) && (
                  <div className="flex items-start gap-2 text-red-600">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="text-xs">
                      {photoUploadMutation.error?.message || 
                       photoDeleteMutation.error?.message || 
                       signedUrlError?.message || 
                       'An error occurred'}
                    </span>
                  </div>
                )}

                {storagePath && !photoUploadMutation.isPending && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Cloud className="h-3 w-3" />
                    <span className="text-xs font-medium">Stored securely</span>
                  </div>
                )}

                {validation && !isValidating && (
                  <div className="space-y-1">
                    {validation.isValid ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-3 w-3" />
                        <span className="text-xs font-medium">Photo meets requirements</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <div key={index} className="flex items-start gap-2 text-red-600">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{error}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {validation.warnings.length > 0 && (
                      <div className="space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <div key={index} className="flex items-start gap-2 text-yellow-600">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFile && validation && !validation.isValid && !disabled && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50"
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">Click to upload a different photo</span>
          </div>
        </div>
      )}
    </div>
  )
}