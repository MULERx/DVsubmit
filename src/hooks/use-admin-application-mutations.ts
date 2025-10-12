import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import type { ApplicationStatus } from '@/generated/prisma'

// Types for mutation inputs
interface PaymentActionInput {
  applicationId: string
  action: 'approve' | 'reject'
}

interface ApplicationRejectionInput {
  applicationId: string
}

// API functions
async function updatePaymentStatus(input: PaymentActionInput): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/admin/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to update payment status')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to update payment status')
  }

  return result
}

async function rejectApplication(input: ApplicationRejectionInput): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/admin/applications/reject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to reject application')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to reject application')
  }

  return result
}

// Custom hooks
export function usePaymentStatusMutation() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (data, variables) => {
      const action = variables.action === 'approve' ? 'approved' : 'rejected'
      toast({
        title: 'Success',
        description: `Payment ${action} successfully`,
      })
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'application', variables.applicationId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useApplicationRejectionMutation() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectApplication,
    onSuccess: (data, variables) => {
      toast({
        title: 'Success',
        description: 'Application rejected successfully. The applicant will be notified to make corrections.',
      })
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'application', variables.applicationId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}