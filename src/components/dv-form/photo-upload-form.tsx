'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Check, AlertTriangle, Image as ImageIcon, Cloud } from 'lucide-react'
import { PhotoValidationResult } from '@/lib/types/application'
import { 
  validatePhotoFile, 
  createImagePreview, 
  revokeImagePreview, 
  formatFileSize,
  DV_PHOTO_REQUIREMENTS 
} from '@/lib/utils/photo-validation'
import { usePhotoUpload } from '@/hooks/use-photo-upload'

interface PhotoUploadFormProps {
  onNext: (data: { file: File; preview: string; path?: string; signedUrl?: string }) => void
  onPrevious: () => void
  initialData?: { file: File; preview: string; path?: string; signedUrl?: string }
  isLoading?: boolean
  applicationId?: string
}

export function PhotoUploadForm({ 
  onNext, 
  onPrevious, 
  initialData,
  isLoading = false,
  applicationId
}: PhotoUploadFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialData?.file || null)
  // Use signedUrl if available, otherwise fall back to preview
  const [preview, setPreview] = useState<string>(initialData?.signedUrl || initialData?.preview || '')
  const [validation, setValidation] = useState<PhotoValidationResult | null>(
    // If we have initial data with a file, assume it's valid
    initialData?.file ? { isValid: true, errors: [], warnings: [] } : null
  )
  const [isValidating, setIsValidating] = useState(false)
  const [storagePath, setStoragePath] = useState<string | undefined>(initialData?.path)
  const [signedUrl, setSignedUrl] = useState<string | undefined>(initialData?.signedUrl)

  const {
    isUploading,
    uploadProgress,
    error: uploadError,
    uploadedPhoto,
    uploadPhoto,
    deletePhoto,
    clearError,
    clearPhoto
  } = usePhotoUpload()

  const validatePhoto = useCallback(async (file: File): Promise<PhotoValidationResult> => {
    return await validatePhotoFile(file)
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsValidating(true)
    setUploadedFile(file)
    clearError()
    
    // Create preview
    const previewUrl = createImagePreview(file)
    setPreview(previewUrl)

    // Validate photo first
    try {
      const validationResult = await validatePhoto(file)
      setValidation(validationResult)

      // If validation passes, upload to Supabase Storage
      if (validationResult.isValid) {
        const uploadResult = await uploadPhoto(file, applicationId)
        
        if (uploadResult.success && uploadResult.data) {
          setStoragePath(uploadResult.data.path)
          setSignedUrl(uploadResult.data.signedUrl)
          // Update preview to use the signed URL for consistency
          if (uploadResult.data.signedUrl) {
            setPreview(uploadResult.data.signedUrl)
          }
        }
      }
    } catch (error) {
      setValidation({
        isValid: false,
        errors: ['Failed to validate photo. Please try again.'],
        warnings: []
      })
    } finally {
      setIsValidating(false)
    }
  }, [validatePhoto, uploadPhoto, applicationId, clearError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: DV_PHOTO_REQUIREMENTS.maxSize,
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
    }
  })

  const removePhoto = useCallback(async () => {
    // Delete from storage if it exists
    if (storagePath) {
      await deletePhoto(storagePath)
    }

    // Clean up local state
    setUploadedFile(null)
    setPreview('')
    setValidation(null)
    setStoragePath(undefined)
    setSignedUrl(undefined)
    
    if (preview) {
      revokeImagePreview(preview)
    }
    
    clearPhoto()
  }, [storagePath, preview, deletePhoto, clearPhoto])

  const handleNext = () => {
    if (uploadedFile && validation?.isValid && storagePath) {
      onNext({ 
        file: uploadedFile, 
        preview,
        path: storagePath,
        signedUrl: signedUrl
      })
    }
  }

  // Handle initial data and refresh signed URL if needed
  useEffect(() => {
    if (initialData?.file && initialData?.path && !signedUrl) {
      // If we have a file and path but no signed URL, we might need to refresh it
      // This handles the case where the signed URL has expired
      const refreshSignedUrl = async () => {
        // You might want to add a function to refresh the signed URL here
        // For now, we'll just use the existing preview or show a placeholder
      }
      refreshSignedUrl()
    }
  }, [initialData, signedUrl])

  // Clean up preview URL on unmount (only if it's a blob URL)
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        revokeImagePreview(preview)
      }
    }
  }, [preview])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Your Photo</h2>
        <p className="text-gray-600 mt-2">
          Upload a recent passport-style photo that meets DV lottery requirements.
        </p>
      </div>

      {/* Photo Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Square format (equal width and height)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>600x600 to 1200x1200 pixels</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>JPEG or PNG format</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Maximum file size: 5MB</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Recent photo (taken within 6 months)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Clear, high-quality image</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <div className="space-y-4">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your photo here' : 'Upload your photo'}
                </p>
                <p className="text-gray-500 mt-1">
                  Drag and drop your photo here, or click to browse
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  JPEG or PNG, max 5MB, square format
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  {preview ? (
                    <img
                      src={signedUrl || preview}
                      alt="Uploaded photo"
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        // If image fails to load, show a placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                    {validation?.metadata && (
                      <p className="text-sm text-gray-500">
                        {validation.metadata.width} × {validation.metadata.height} pixels
                      </p>
                    )}
                  </div>

                  {(isValidating || isUploading) && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">
                        {isValidating ? 'Validating photo...' : 'Uploading to secure storage...'}
                      </span>
                      {isUploading && uploadProgress > 0 && (
                        <span className="text-xs">({uploadProgress}%)</span>
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-start gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{uploadError}</span>
                    </div>
                  )}

                  {storagePath && !isUploading && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Cloud className="h-4 w-4" />
                      <span className="text-sm font-medium">Securely stored in cloud</span>
                    </div>
                  )}

                  {validation && !isValidating && (
                    <div className="space-y-2">
                      {validation.isValid ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Photo meets all requirements</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {validation.errors.map((error, index) => (
                            <div key={index} className="flex items-start gap-2 text-red-600">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{error}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div className="space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start gap-2 text-yellow-600">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{warning}</span>
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

        {uploadedFile && validation && !validation.isValid && (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50"
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <ImageIcon className="h-5 w-5" />
              <span className="text-sm">Click to upload a different photo</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={isLoading || !uploadedFile || !validation?.isValid || isValidating || isUploading || !storagePath}
          className="min-w-32"
        >
          {isLoading ? 'Processing...' : isUploading ? 'Uploading...' : 'Next'}
        </Button>
      </div>
    </div>
  )
}