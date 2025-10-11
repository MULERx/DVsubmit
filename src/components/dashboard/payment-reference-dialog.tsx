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

interface PaymentReferenceDialogProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  currentPaymentReference?: string
  applicantName: string
  onSuccess?: () => void
}

export function PaymentReferenceDialog({
  isOpen,
  onClose,
  applicationId,
  currentPaymentReference,
  applicantName,
  onSuccess
}: PaymentReferenceDialogProps) {
  const [paymentReference, setPaymentReference] = useState(currentPaymentReference || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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

    setIsSubmitting(true)
    try {
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

      toast({
        title: 'Success',
        description: 'Payment reference updated successfully. Your application will be reviewed again.',
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error updating payment reference:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update payment reference',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
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
                disabled={isSubmitting}
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
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Payment Reference'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}