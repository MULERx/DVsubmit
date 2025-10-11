import { useQuery } from '@tanstack/react-query'

export interface AdminApplication {
  id: string
  givenName: string
  familyName: string
  email: string
  status: string
  paymentReference?: string
  confirmationNumber?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    createdAt: string
  }
}

export interface AdminApplicationsResponse {
  success: boolean
  data?: {
    applications: AdminApplication[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: {
    code: string
    message: string
  }
}

interface UseAdminApplicationsParams {
  page?: number
  limit?: number
  status?: string
  type?: string
}

async function fetchAdminApplications(params: UseAdminApplicationsParams): Promise<AdminApplicationsResponse['data']> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.status) searchParams.append('status', params.status)
  if (params.type) searchParams.append('type', params.type)

  const response = await fetch(`/api/admin/applications?${searchParams}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }
  
  const result: AdminApplicationsResponse = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to fetch applications')
  }
  
  return result.data
}

export function useAdminApplications(params: UseAdminApplicationsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'applications', params],
    queryFn: () => fetchAdminApplications(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })
}