import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

interface PaymentActionParams {
  applicationId: string
  action: 'approve' | 'reject'
}

interface PaymentActionResponse {
  success: boolean
  data?: {
    application: any
    action: string
    message: string
  }
  error?: string
}

async function updatePaymentStatus({ applicationId, action }: PaymentActionParams): Promise<PaymentActionResponse> {
  const response = await fetch(`/api/admin/payments/${applicationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update payment status')
  }

  return result
}

export function usePaymentActions() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.data?.message || 'Payment status updated successfully',
      })
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment status',
        variant: 'destructive',
      })
    },
  })
}