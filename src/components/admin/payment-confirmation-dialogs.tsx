'use client'

import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ApprovePaymentDialogProps {
  onApprove: () => void
  isApproving: boolean
  disabled?: boolean
  paymentReference?: string
}

interface RejectPaymentDialogProps {
  onReject: () => void
  isRejecting: boolean
  disabled?: boolean
  paymentReference?: string
}

export function ApprovePaymentDialog({
  onApprove,
  isApproving,
  disabled = false,
  paymentReference
}: ApprovePaymentDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={disabled || isApproving}
          className="bg-green-600 hover:bg-green-700 cursor-pointer"
        >
          {isApproving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Approving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Approve Payment
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve this payment?
            {paymentReference && (
              <>
                <br />
                <br />
                <strong>Payment Reference:</strong> {paymentReference}
              </>
            )}
            <br />
            <br />
            This action will mark the payment as verified and allow the application to proceed to the next stage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onApprove}
            disabled={isApproving}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {isApproving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </>
            ) : (
              'Approve Payment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function RejectPaymentDialog({
  onReject,
  isRejecting,
  disabled = false,
  paymentReference
}: RejectPaymentDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={disabled || isRejecting}
          className="bg-red-600 hover:bg-red-700 cursor-pointer"
        >
          {isRejecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Rejecting...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Reject Payment
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject this payment?
            {paymentReference && (
              <>
                <br />
                <br />
                <strong>Payment Reference:</strong> {paymentReference}
              </>
            )}
            <br />
            <br />
            This action will mark the payment as rejected and the applicant will need to submit a new payment reference.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onReject}
            disabled={isRejecting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isRejecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rejecting...
              </>
            ) : (
              'Reject Payment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}