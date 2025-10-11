import { useQuery } from '@tanstack/react-query'

export interface Statistics {
  totalSubmittedApplications: number
  pendingPaymentVerify: number
  rejectedPayments: number
  pendingReviewAndSubmit: number
  submittedToDV: number
}

export interface StatisticsResponse {
  success: boolean
  data?: Statistics
  error?: string
}

async function fetchStatistics(): Promise<Statistics> {
  const response = await fetch('/api/admin/statistics')
  
  if (!response.ok) {
    throw new Error('Failed to fetch statistics')
  }
  
  const result: StatisticsResponse = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch statistics')
  }
  
  return result.data
}

export function useStatistics() {
  return useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: fetchStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })
}