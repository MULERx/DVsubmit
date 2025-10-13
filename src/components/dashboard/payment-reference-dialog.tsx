'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient, useMutation } from '@tanstack/react-query'

interface PaymentReferenceDialogProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  currentPaymentReference?: string
  applicantName: string
}

// API function for updating payment reference
const updatePaymentReference = async ({ applicationId, paymentReference }: { applicationId: string; paymentReference: string }) => {
  const response = await fetch(`/api/applications/${applicationId}/payment-reference`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentReference: paymentReference.trim()
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Failed to update payment reference')
  }

  return response.json()
}

export function PaymentReferenceDialog({
  isOpen,
  onClose,
  applicationId,
  currentPaymentReference,
  applicantName,
}: PaymentReferenceDialogProps) {
  const [paymentReference, setPaymentReference] = useState(currentPaymentReference || '')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updatePaymentReference,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Payment reference updated successfully. Your application will be reviewed again.',
      })

      // Invalidate and refetch user applications
      queryClient.invalidateQueries({
        queryKey: ['applications', 'user']
      })

      onClose()
    },
    onError: (error: Error) => {
      console.error('Error updating payment reference:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment reference',
        variant: 'destructive',
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentReference.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a payment reference',
        variant: 'destructive',
      })
      return
    }

    mutation.mutate({
      applicationId,
      paymentReference: paymentReference.trim()
    })
  }

  const handleClose = () => {
    if (!mutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Payment Reference</DialogTitle>
          <DialogDescription>
            Update the payment reference for {applicantName}&apos;s application.
            Your application will be reviewed again after updating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="paymentReference">
                Payment Reference Number
              </Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter your payment reference number"
                disabled={mutation.isPending}
                required
              />
              <p className="text-sm text-gray-500">
                Enter the reference number from your payment receipt or bank transfer.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Update Payment Reference'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}