'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface RejectApplicationDialogProps {
  onReject: (rejectionNote: string) => void
  isRejecting: boolean
  disabled?: boolean
}

export function RejectApplicationDialog({
  onReject,
  isRejecting,
  disabled = false
}: RejectApplicationDialogProps) {
  const [open, setOpen] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')

  const handleReject = () => {
    if (rejectionNote.trim()) {
      onReject(rejectionNote.trim())
      setOpen(false)
      setRejectionNote('')
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setRejectionNote('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={disabled || isRejecting}
          className="bg-red-600 hover:bg-red-700 cursor-pointer"
        >
          {isRejecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Rejecting Application...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Reject Application
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this application. This note will help the applicant understand what needs to be corrected.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rejection-note">
              Rejection Note <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-note"
              placeholder="Please explain why this application is being rejected and what the applicant needs to correct..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              className="min-h-[100px]"
              disabled={isRejecting}
            />
            {rejectionNote.trim().length === 0 && (
              <p className="text-sm text-red-500">Rejection note is required</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectionNote.trim() || isRejecting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRejecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rejecting...
              </>
            ) : (
              'Reject Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}