'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ApplicationRecord, ApplicationStatus } from '@/lib/types/application'
import { useUserApplications } from '@/hooks/use-application-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { PaymentReferenceDialog } from './payment-reference-dialog'
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Copy,
  Edit,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserDashboardProps {
  className?: string
}



export function UserDashboard({ className }: UserDashboardProps) {
  const { user, userWithRole } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [downloadingProof, setDownloadingProof] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null)

  // Use TanStack Query to fetch applications
  const {
    data: applications = [],
    isLoading: loading,
    error: fetchError,
    refetch: refetchApplications
  } = useUserApplications(!!user)


  // Show error toast if fetch fails
  if (fetchError) {
    toast({
      title: 'Error',
      description: fetchError.message || 'Failed to load applications',
      variant: 'destructive',
    })
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      PAYMENT_PENDING: { variant: 'outline' as const, label: 'Payment Verifing', icon: Clock },
      PAYMENT_VERIFIED: { variant: 'default' as const, label: 'Payment Verified', icon: CheckCircle },
      PAYMENT_REJECTED: { variant: 'destructive' as const, label: 'Payment Rejected', icon: XCircle },
      APPLICATION_REJECTED: { variant: 'destructive' as const, label: 'Application Rejected', icon: XCircle },
      SUBMITTED: { variant: 'default' as const, label: 'Submitted to DV System', icon: Upload },
    }

    const config = statusConfig[status] || statusConfig.PAYMENT_PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const downloadProofOfSubmission = async (applicationId: string, confirmationNumber: string) => {
    try {
      setDownloadingProof(applicationId)

      const response = await fetch(`/api/applications/${applicationId}/proof`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to generate proof of submission')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `DV-Submission-Proof-${confirmationNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: 'Proof of submission downloaded successfully',
      })
    } catch (error) {
      console.error('Error downloading proof:', error)
      toast({
        title: 'Error',
        description: 'Failed to download proof of submission',
        variant: 'destructive',
      })
    } finally {
      setDownloadingProof(null)
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


  const handleCheckPayment = (application: ApplicationRecord) => {
    setSelectedApplication(application)
    setPaymentDialogOpen(true)
  }

  const handleEditApplication = (applicationId: string) => {
    router.push(`/dv-form?applicationId=${applicationId}`)
  }

  const handlePaymentReferenceSuccess = () => {
    // Reload applications to get updated status using TanStack Query
    refetchApplications()
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
    app.status === 'PAYMENT_PENDING' || app.status === 'PAYMENT_VERIFIED' || app.status === 'PAYMENT_REJECTED' || app.status === 'APPLICATION_REJECTED'
  )
  const submittedApplications = applications.filter(app =>
    app.status === 'SUBMITTED'
  )

  return (
    <div className={className}>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
              Welcome back, {userWithRole?.dbUser?.email}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage DV lottery applications for yourself and family members.
            </p>
          </div>
          <Button asChild size="sm" >
            <Link href="/dv-form">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Applications Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingApplications.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Awaiting payment/processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{submittedApplications.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Successfully submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{applications.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">All applications</p>
          </CardContent>
        </Card>
      </div>



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
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {application.givenName} {application.familyName}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="truncate">
                        <span className="font-medium">Payment Ref:</span> {application.paymentReference || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(application.createdAt)}
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <span className="font-medium">Updated:</span> {formatDate(application.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    {application.status === 'PAYMENT_REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckPayment(application)}
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span >Check Payment</span>
                      </Button>
                    )}
                    {application.status === 'APPLICATION_REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditApplication(application.id)}
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Edit Application</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    )}
                    {(application.status === 'PAYMENT_PENDING' || application.status === 'PAYMENT_VERIFIED') && (
                      <div className="text-xs sm:text-sm text-gray-500 italic flex items-center justify-center sm:justify-start">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Processing
                      </div>
                    )}
                  </div>
                </div>
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
            <div className="space-y-4">
              {submittedApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200 gap-3 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {application.givenName} {application.familyName}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <span className="font-medium">Confirmation:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-green-700 select-all text-xs sm:text-sm break-all">
                            {application.confirmationNumber}
                          </span>
                          <button
                            onClick={() => copyConfirmationNumber(application.confirmationNumber!)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                            title="Copy confirmation number"
                          >
                            <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{' '}
                        <span className="block sm:inline">
                          {application.submittedAt ? formatDate(application.submittedAt) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Country:</span> {application.countryOfBirth}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {application.confirmationNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadProofOfSubmission(application.id, application.confirmationNumber!)}
                        disabled={downloadingProof === application.id}
                        className="text-xs sm:text-sm"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">
                          {downloadingProof === application.id ? 'Downloading...' : 'Download Proof'}
                        </span>
                        <span className="sm:hidden">
                          {downloadingProof === application.id ? 'Loading...' : 'Download'}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Applications State */}
      {applications.length === 0 && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Start Your First DV Application</CardTitle>
            <CardDescription className="text-sm">
              You haven&apos;t created any applications yet. Start your first DV lottery application for yourself or a family member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="sm:size-lg w-full sm:w-auto">
              <Link href="/dv-form">
                <FileText className="h-4 w-4 mr-2" />
                Create First Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}



      {/* Payment Reference Dialog */}
      {selectedApplication && (
        <PaymentReferenceDialog
          isOpen={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false)
            setSelectedApplication(null)
          }}
          applicationId={selectedApplication.id}
          currentPaymentReference={selectedApplication.paymentReference || ''}
          applicantName={`${selectedApplication.givenName} ${selectedApplication.familyName}`}
          onSuccess={handlePaymentReferenceSuccess}
        />
      )}
    </div>
  )
}