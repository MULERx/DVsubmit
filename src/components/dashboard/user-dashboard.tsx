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
  CreditCard,
  Printer
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
  const [printingProof, setPrintingProof] = useState<string | null>(null)
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

  const printProofOfSubmission = async (applicationId: string, confirmationNumber: string, fullName: string, dateOfBirth: Date) => {
    try {
      setPrintingProof(applicationId)

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.')
      }

      const formattedDate = new Date(dateOfBirth).toISOString().split('T')[0]
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      // Generate HTML content for printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>DV Lottery Submission Proof - ${confirmationNumber}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 40px;
              background: white;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .content {
              max-width: 600px;
              margin: 0 auto;
            }
            .info-section {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 30px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 16px;
              color: #111827;
              font-weight: 500;
            }
            .confirmation-number {
              font-family: 'Courier New', monospace;
              font-size: 20px;
              font-weight: bold;
              color: #059669;
              background: #ecfdf5;
              padding: 10px 15px;
              border-radius: 6px;
              border: 2px solid #10b981;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #6b7280;
              font-size: 12px;
            }
            .important-note {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 20px;
              margin-top: 30px;
            }
            .important-note h4 {
              color: #92400e;
              margin: 0 0 10px 0;
              font-size: 14px;
              font-weight: 600;
            }
            .important-note p {
              color: #78350f;
              margin: 0;
              font-size: 13px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div class="header">
              <div class="title">DV Lottery Submission Proof</div>
              <div class="subtitle">Diversity Visa Program - Official Confirmation</div>
              <div class="subtitle">Generated on ${currentDate}</div>
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Full Name</span>
                <span class="info-value">${fullName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">DV Confirmation Number</span>
                <span class="confirmation-number">${confirmationNumber}</span>
              </div>
            </div>

            <div class="important-note">
              <h4>⚠️ Important Information</h4>
              <p>
                This confirmation number is your proof of entry into the DV Lottery program. 
                Keep this document safe and use this confirmation number to check your status 
                on the official DV website. Do not lose this number as it cannot be retrieved later.
              </p>
            </div>

            <div class="footer">
              <p>This document was generated from your DV Lottery application system.</p>
              <p>For official status checks, visit the U.S. Department of State DV website.</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{pendingApplications.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Awaiting payment/processing</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{submittedApplications.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Successfully submitted</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{applications.length}</div>
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
            <div className="grid gap-4 md:gap-6">
              {pendingApplications.map((application) => (
                <Card key={application.id} className="border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    {/* Header with name and status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {application.givenName.charAt(0)}{application.familyName.charAt(0)}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {application.givenName} {application.middleName} {application.familyName}
                            </h3>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(application.status)}
                      </div>
                    </div>

                    {/* Application Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment Reference</div>
                        <div className="text-sm font-mono text-gray-900 truncate">
                          {application.paymentReference || 'Not provided'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date of Birth</div>
                        <div className="text-sm text-gray-900 font-mono">{new Date(application.dateOfBirth).toISOString().split('T')[0]}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2 lg:col-span-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Created</div>
                        <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                      </div>
                    </div>

                    {/* Rejection Note */}
                    {application.status === 'APPLICATION_REJECTED' && application.rejectionNote && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                            <p className="text-sm text-red-700 leading-relaxed mb-2">{application.rejectionNote}</p>
                            <p className="text-xs text-red-600 italic">
                              Please review the feedback above and edit your application to address the issues mentioned.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {application.status === 'PAYMENT_REJECTED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckPayment(application)}
                          className="flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <CreditCard className="h-4 w-4" />
                          Update Payment Reference
                        </Button>
                      )}
                      {application.status === 'APPLICATION_REJECTED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditApplication(application.id)}
                          className="flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Application
                        </Button>
                      )}
                      {(application.status === 'PAYMENT_PENDING' || application.status === 'PAYMENT_VERIFIED') && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 italic py-2">
                          <Clock className="h-4 w-4" />
                          Processing...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                <Card key={application.id} className=" bg-green-50/50">
                  <CardContent className="p-4 sm:p-6">
                    {/* Header with name and status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {application.givenName.charAt(0)}{application.familyName.charAt(0)}
                          </div>
                           <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {application.givenName} {application.middleName} {application.familyName}
                            </h3>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(application.status)}
                      </div>
                    </div>

                    {/* Confirmation Number - Prominent Display */}
                    <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                            DV Confirmation Number
                          </div>
                          <div className="font-mono text-lg font-bold text-green-800 select-all break-all">
                            {application.confirmationNumber}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyConfirmationNumber(application.confirmationNumber!)}
                          className="ml-3 text-green-600 hover:text-green-700 hover:bg-green-100"
                          title="Copy confirmation number"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Application Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date of Birth</div>
                        <div className="text-sm text-gray-900 font-mono">{new Date(application.dateOfBirth).toISOString().split('T')[0]}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted Date</div>
                        <div className="text-sm text-gray-900">
                          {application.submittedAt ? formatDate(application.submittedAt) : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 sm:col-span-2 lg:col-span-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Application Created</div>
                        <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 justify-end">
                      {application.confirmationNumber && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadProofOfSubmission(application.id, application.confirmationNumber!)}
                            disabled={downloadingProof === application.id || printingProof === application.id}
                            className="flex text-sm items-center justify-center gap-2 text-sm font-medium border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4" />
                            {downloadingProof === application.id ? 'Downloading...' : 'Download'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printProofOfSubmission(
                              application.id,
                              application.confirmationNumber!,
                              `${application.givenName} ${application.familyName}`,
                              application.dateOfBirth
                            )}
                            disabled={downloadingProof === application.id || printingProof === application.id}
                            className="flex items-center  text-sm justify-center gap-2 text-sm font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Printer className="h-4 w-4" />
                            {printingProof === application.id ? 'Opening Print...' : 'Print'}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
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