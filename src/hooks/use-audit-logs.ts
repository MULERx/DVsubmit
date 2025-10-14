import { useQuery } from '@tanstack/react-query'

export interface AuditLog {
  id: string
  action: string
  details: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    email: string
    role: string
  } | null
  application: {
    id: string
    familyName: string
    givenName: string
    email: string
    status: string
  } | null
}

export interface AuditLogsPagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[]
  pagination: AuditLogsPagination
}

export interface AuditLogsFilters {
  action: string
  userId: string
  applicationId: string
  startDate: string
  endDate: string
  search: string
}

interface UseAuditLogsParams {
  page?: number
  limit?: number
  action?: string
  userId?: string
  applicationId?: string
  startDate?: string
  endDate?: string
  search?: string
}

async function fetchAuditLogs(params: UseAuditLogsParams): Promise<AuditLogsResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.action) searchParams.append('action', params.action)
  if (params.userId) searchParams.append('userId', params.userId)
  if (params.applicationId) searchParams.append('applicationId', params.applicationId)
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)
  if (params.search) searchParams.append('search', params.search)

  const response = await fetch(`/api/admin/audit-logs?${searchParams}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs')
  }
  
  const data: AuditLogsResponse = await response.json()
  return data
}

export function useAuditLogs(params: UseAuditLogsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })
}