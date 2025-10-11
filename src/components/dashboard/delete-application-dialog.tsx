'use client'

import { Trash2 } from 'lucide-react'
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

interface DeleteApplicationDialogProps {
  applicationId: string
  applicantName: string
  onDelete: (applicationId: string, applicantName: string) => void
  isDeleting: boolean
}

export function DeleteApplicationDialog({
  applicationId,
  applicantName,
  onDelete,
  isDeleting
}: DeleteApplicationDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Application</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the application for{' '}
            <strong>{applicantName}</strong>?
            This action cannot be undone and all progress will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(applicationId, applicantName)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete Application
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}