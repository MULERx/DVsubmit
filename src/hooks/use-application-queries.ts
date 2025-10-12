import { useQuery } from '@tanstack/react-query'
import { ApplicationRecord } from '@/lib/types/application'

// Types
interface ApplicationResponse {
  success: boolean
  data?: ApplicationRecord
  error?: {
    message: string
    code?: string
  }
}

interface ApplicationsListResponse {
  success: boolean
  data?: ApplicationRecord[]
  error?: {
    message: string
    code?: string
  }
}

// API functions
const fetchApplication = async (id: string): Promise<ApplicationRecord> => {
  const response = await fetch(`/api/applications/${id}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch application: ${response.statusText}`)
  }

  const result: ApplicationResponse = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to load application')
  }

  return result.data
}

const fetchUserApplications = async (): Promise<ApplicationRecord[]> => {
  const response = await fetch('/api/applications')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch applications: ${response.statusText}`)
  }

  const result: ApplicationsListResponse = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to load applications')
  }

  return result.data || []
}

// Custom hooks
export function useApplication(id: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => fetchApplication(id!),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (application not found)
      if (error.message.includes('404')) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useUserApplications(enabled: boolean = true) {
  return useQuery({
    queryKey: ['applications', 'user'],
    queryFn: fetchUserApplications,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Helper hook for checking if an application exists
export function useApplicationExists(id: string | null) {
  const { data, isLoading, error } = useApplication(id, !!id)
  
  return {
    exists: !!data,
    application: data,
    isLoading,
    error,
    notFound: error?.message.includes('404') || error?.message.includes('not found')
  }
}