import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

// Types for mutation inputs
interface PaymentActionInput {
  applicationId: string
  action: 'approve' | 'reject'
}

interface ApplicationRejectionInput {
  applicationId: string
  rejectionNote: string
}

interface ApplicationSubmissionInput {
  applicationId: string
  confirmationNumber: string
}

// API functions
async function updatePaymentStatus(input: PaymentActionInput): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/admin/payments/verify', {
    method: 'PUT',
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

async function submitApplication(input: ApplicationSubmissionInput): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/admin/applications/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to submit application')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to submit application')
  }

  return result
}

// Custom hooks
export function usePaymentStatusMutation() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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

export function useApplicationSubmissionMutation() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitApplication,
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: 'Application submitted successfully to the DV lottery system.',
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