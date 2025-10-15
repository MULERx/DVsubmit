'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ApplicationRecord } from '@/lib/types/application'
import { useUserApplications } from '@/hooks/use-application-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Components
import { DashboardHeader } from './dashboard-header'
import { ApplicationsOverview } from './applications-overview'
import { ApplicationCard } from './application-card'
import { PaymentReferenceDialog } from './payment-reference-dialog'
import { EmptyState } from './empty-state'
import { generatePrintHTML } from './print-utils'

interface UserDashboardProps {
  className?: string
}

export function UserDashboard({ className }: UserDashboardProps) {
  const { user, userWithRole } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [printingProof, setPrintingProof] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null)

  // Use TanStack Query to fetch applications
  const {
    data: applications = [],
    isLoading: loading,
    error: fetchError,
  } = useUserApplications(!!user)

  // Show error toast if fetch fails
  useEffect(() => {
    if (fetchError) {
      toast({
        title: 'Error',
        description: fetchError.message || 'Failed to load applications',
        variant: 'destructive',
      })
    }
  }, [fetchError, toast])

  const printProofOfSubmission = async (
    applicationId: string,
    confirmationNumber: string,
    fullName: string,
    dateOfBirth: Date
  ) => {
    try {
      setPrintingProof(applicationId)

      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.')
      }

      const htmlContent = generatePrintHTML(confirmationNumber, fullName, dateOfBirth)

      printWindow.document.open()
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      toast({
        title: 'Success',
        description: 'Print dialog opened successfully',
      })
    } catch (error) {
      console.error('Error printing proof:', error)
      toast({
        title: 'Error',
        description: 'Failed to open print dialog',
        variant: 'destructive',
      })
    } finally {
      setPrintingProof(null)
    }
  }

  const copyConfirmationNumber = async (confirmationNumber: string) => {
    try {
      await navigator.clipboard.writeText(confirmationNumber)
      toast({
        title: 'Copied!',
        description: 'Confirmation number copied to clipboard',
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy confirmation number',
        variant: 'destructive',
      })
    }
  }

  const handleUpdatePayment = (application: ApplicationRecord) => {
    setSelectedApplication(application)
    setPaymentDialogOpen(true)
  }

  const handleEditApplication = (applicationId: string) => {
    router.push(`/dv-form?applicationId=${applicationId}`)
  }

  const handleCloseDialog = () => {
    setPaymentDialogOpen(false)
    setSelectedApplication(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[65vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Organize applications by status
  const pendingApplications = applications.filter(app =>
    app.status === 'PAYMENT_PENDING' ||
    app.status === 'PAYMENT_VERIFIED' ||
    app.status === 'PAYMENT_REJECTED' ||
    app.status === 'APPLICATION_REJECTED'
  )

  const submittedApplications = applications.filter(app =>
    app.status === 'SUBMITTED'
  )

  return (
    <div className={className}>
      <DashboardHeader userEmail={userWithRole?.dbUser?.email} />

      <ApplicationsOverview applications={applications} />

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Pending Applications</CardTitle>
            <CardDescription className="text-sm">
              These applications are awaiting payment verification or processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:gap-6">
              {pendingApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  variant="pending"
                  onUpdatePayment={handleUpdatePayment}
                  onEditApplication={handleEditApplication}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Applications */}
      {submittedApplications.length > 0 && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Submitted Applications</CardTitle>
            <CardDescription className="text-sm">
              Successfully submitted DV lottery applications with confirmation numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-6">
              {submittedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  variant="submitted"
                  onCopyConfirmation={copyConfirmationNumber}
                  onPrintProof={printProofOfSubmission}
                  isPrinting={printingProof === application.id}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Applications State */}
      {applications.length === 0 && <EmptyState />}

      {/* Payment Reference Dialog */}
      {selectedApplication && (
        <PaymentReferenceDialog
          isOpen={paymentDialogOpen}
          onClose={handleCloseDialog}
          applicationId={selectedApplication.id}
          currentPaymentReference={selectedApplication.paymentReference || ''}
          applicantName={`${selectedApplication.givenName} ${selectedApplication.familyName}`}
        />
      )}
    </div>
  )
}