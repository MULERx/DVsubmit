import { useQuery } from '@tanstack/react-query'
import type { Application, User } from '@/generated/prisma'

// Type for applications list with user relation
export type AdminApplicationListItem = Application & {
  user: Pick<User, 'id' | 'email'>
}

// Query parameters for filtering/pagination
export interface AdminApplicationsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// API functions
async function fetchAdminApplications(params: AdminApplicationsParams = {}): Promise<{
  applications: AdminApplicationListItem[]
  total: number
  page: number
  limit: number
}> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.status) searchParams.set('status', params.status)
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)

  const response = await fetch(`/api/admin/applications?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to load applications')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to load applications')
  }

  return result.data
}

// Custom hooks
export function useAdminApplications(params: AdminApplicationsParams = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'applications', params],
    queryFn: () => fetchAdminApplications(params),
    enabled,
    staleTime: 30000, // 30 seconds
    retry: 2,
  })
}