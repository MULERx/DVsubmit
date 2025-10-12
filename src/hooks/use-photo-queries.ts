import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

// Types
interface SignedUrlResponse {
  success: boolean
  signedUrl?: string
  expiresIn?: number
  error?: string
}

interface PhotoUploadResponse {
  success: boolean
  data?: {
    path: string
    signedUrl?: string
  }
  error?: string
}

// API functions
const fetchSignedUrl = async (path: string): Promise<SignedUrlResponse> => {
  const response = await fetch('/api/photos/signed-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get signed URL: ${response.statusText}`)
  }

  return response.json()
}

const uploadPhoto = async (formData: FormData): Promise<PhotoUploadResponse> => {
  const response = await fetch('/api/photos/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload photo: ${response.statusText}`)
  }

  return response.json()
}

// Custom hooks
export function useSignedUrl(path: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['photo', 'signed-url', path],
    queryFn: () => fetchSignedUrl(path!),
    enabled: enabled && !!path,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  })
}

export function usePhotoUpload() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Photo uploaded successfully',
        })
        
        // Invalidate signed URL queries to refresh any cached URLs
        queryClient.invalidateQueries({ queryKey: ['photo', 'signed-url'] })
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function usePhotoDelete() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deletePhoto = async (path: string): Promise<{ success: boolean; error?: string }> => {
    const response = await fetch('/api/photos/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete photo: ${response.statusText}`)
    }

    return response.json()
  }

  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
      })
      
      // Invalidate all photo-related queries
      queryClient.invalidateQueries({ queryKey: ['photo'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}