import { useQuery } from '@tanstack/react-query'
import type { Application, User, Child } from '@/generated/prisma'

// Type for the full application with relations
export type AdminApplicationDetail = Application & {
  user: Pick<User, 'id' | 'email' | 'createdAt'>
  children: Child[]
}

// API functions
async function fetchAdminApplication(id: string): Promise<AdminApplicationDetail> {
  const response = await fetch(`/api/admin/applications/${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to load application')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to load application')
  }

  return result.data
}

// Custom hooks
export function useAdminApplication(id: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'application', id],
    queryFn: () => fetchAdminApplication(id!),
    enabled: enabled && !!id,
    staleTime: 30000, // 30 seconds
    retry: 2,
  })
}