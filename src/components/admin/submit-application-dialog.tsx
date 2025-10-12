'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SubmitApplicationDialogProps {
  onSubmit: (confirmationNumber: string) => void
  isSubmitting: boolean
  disabled?: boolean
  applicantName?: string
}

export function SubmitApplicationDialog({
  onSubmit,
  isSubmitting,
  disabled = false,
  applicantName
}: SubmitApplicationDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState('')

  const handleSubmit = () => {
    if (confirmationNumber.trim()) {
      onSubmit(confirmationNumber.trim())
      setOpen(false)
      setConfirmationNumber('')
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setConfirmationNumber('')
  }

  // Validate DV confirmation number format (typically 2024XXXXXXXXXX)
  const isValidConfirmationNumber = (number: string) => {
    // DV confirmation numbers are typically 14 characters: 4-digit year + 10 digits
    const dvPattern = /^20\d{2}[A-Z0-9]{10}$/i
    return dvPattern.test(number.trim())
  }

  const isValid = confirmationNumber.trim() && isValidConfirmationNumber(confirmationNumber)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Application to DV System</DialogTitle>
          <DialogDescription>
            Enter the DV confirmation number received after successfully submitting this application to the official DV lottery system.
            {applicantName && (
              <>
                <br />
                <br />
                <strong>Applicant:</strong> {applicantName}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="confirmation-number">
              DV Confirmation Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmation-number"
              placeholder="e.g., 2024AB12345678"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value.toUpperCase())}
              className="font-mono"
              disabled={isSubmitting}
              maxLength={14}
            />
            {confirmationNumber.trim() && !isValidConfirmationNumber(confirmationNumber) && (
              <p className="text-sm text-red-500">
                Please enter a valid DV confirmation number (format: 2024XXXXXXXXXX)
              </p>
            )}
            {!confirmationNumber.trim() && (
              <p className="text-sm text-gray-500">
                This number is provided by the official DV lottery system after successful submission
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}