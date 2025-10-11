'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ApplicationService } from '@/lib/services/application-service'
import { ApplicationRecord, ApplicationStatus, PaymentStatus } from '@/lib/types/application'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { DeleteApplicationDialog } from './delete-application-dialog'
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Copy,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface UserDashboardProps {
  className?: string
}

const MAX_DRAFT_APPLICATIONS = 5

export function UserDashboard({ className }: UserDashboardProps) {
  const { user, userWithRole } = useAuth()
  const { toast } = useToast()
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingProof, setDownloadingProof] = useState<string | null>(null)
  const [deletingApplication, setDeletingApplication] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadApplications()
    }
  }, [user])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const response = await ApplicationService.getApplications()

      if (response.success && response.data) {
        setApplications(response.data)
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load applications',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft', icon: FileText },
      PAYMENT_PENDING: { variant: 'outline' as const, label: 'Payment Pending', icon: Clock },
      PAYMENT_VERIFIED: { variant: 'default' as const, label: 'Payment Verified', icon: CheckCircle },
      SUBMITTED: { variant: 'default' as const, label: 'Submitted to DV System', icon: Upload },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed', icon: CheckCircle },
      EXPIRED: { variant: 'destructive' as const, label: 'Expired', icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.DRAFT
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      PENDING: { variant: 'outline' as const, label: 'Pending Verification', icon: Clock },
      VERIFIED: { variant: 'default' as const, label: 'Verified', icon: CheckCircle },
      REJECTED: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      REFUNDED: { variant: 'secondary' as const, label: 'Refunded', icon: AlertCircle },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
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

  const handleDeleteApplication = async (applicationId: string, applicantName: string) => {
    try {
      setDeletingApplication(applicationId)
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete application')
      }

      // Remove the application from the local state
      setApplications(prev => prev.filter(app => app.id !== applicationId))
      
      toast({
        title: 'Application Deleted',
        description: `Application for ${applicantName} has been deleted successfully.`,
      })
    } catch (error) {
      console.error('Error deleting application:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeletingApplication(null)
    }
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Organize applications by status
  const draftApplications = applications.filter(app => app.status === 'DRAFT')
  const pendingApplications = applications.filter(app =>
    app.status === 'PAYMENT_PENDING' || app.status === 'PAYMENT_VERIFIED'
  )
  const submittedApplications = applications.filter(app =>
    app.status === 'SUBMITTED' || app.status === 'CONFIRMED'
  )

  // Check if user can create new applications
  const canCreateNewApplication = draftApplications.length < MAX_DRAFT_APPLICATIONS
  const remainingDrafts = MAX_DRAFT_APPLICATIONS - draftApplications.length

  return (
    <div className={className}>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userWithRole?.dbUser?.email}</h1>
            <p className="text-gray-600 mt-2">
              Manage DV lottery applications for yourself and family members.
            </p>
          </div>
          {canCreateNewApplication ? (
            <Button asChild size="lg">
              <Link href="/dv-form">
                <FileText className="h-5 w-5 mr-2" />
                New Application
              </Link>
            </Button>
          ) : (
            <Button size="lg" disabled>
              <FileText className="h-5 w-5 mr-2" />
              Draft Limit Reached
            </Button>
          )}
        </div>
      </div>

      {/* Draft Limit Warning */}
      {!canCreateNewApplication && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Draft Application Limit Reached
            </CardTitle>
            <CardDescription className="text-orange-700">
              You have reached the maximum of {MAX_DRAFT_APPLICATIONS} draft applications. 
              Please submit or delete existing drafts to create new applications.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Applications Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {draftApplications.length}
              <span className="text-lg text-gray-500">/{MAX_DRAFT_APPLICATIONS}</span>
            </div>
            <p className="text-sm text-gray-500">
              {canCreateNewApplication 
                ? `${remainingDrafts} more allowed`
                : 'Limit reached'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingApplications.length}</div>
            <p className="text-sm text-gray-500">Awaiting payment/processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{submittedApplications.length}</div>
            <p className="text-sm text-gray-500">Successfully submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{applications.length}</div>
            <p className="text-sm text-gray-500">All applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Draft Applications */}
      {draftApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Draft Applications</CardTitle>
                <CardDescription>
                  Complete these applications to submit them for the DV lottery.
                </CardDescription>
              </div>
              {canCreateNewApplication ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dv-form">
                    <FileText className="h-4 w-4 mr-2" />
                    Start Fresh Application
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Limit Reached ({MAX_DRAFT_APPLICATIONS}/{MAX_DRAFT_APPLICATIONS})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {draftApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {application.firstName} {application.lastName}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Country of Birth:</span> {application.countryOfBirth}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(application.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {formatDate(application.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dv-form?edit=${application.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Continue
                      </Link>
                    </Button>
                    <DeleteApplicationDialog
                      applicationId={application.id}
                      applicantName={`${application.firstName} ${application.lastName}`}
                      onDelete={handleDeleteApplication}
                      isDeleting={deletingApplication === application.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>
              These applications are awaiting payment verification or processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {application.firstName} {application.lastName}
                      </h4>
                      {getStatusBadge(application.status)}
                      {getPaymentStatusBadge(application.paymentStatus)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Country of Birth:</span> {application.countryOfBirth}
                      </div>
                      <div>
                        <span className="font-medium">Payment Ref:</span> {application.paymentReference || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {formatDate(application.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* No actions available for pending applications */}
                    <div className="text-sm text-gray-500 italic flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Processing - No actions available
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Applications */}
      {submittedApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submitted Applications</CardTitle>
            <CardDescription>
              Successfully submitted DV lottery applications with confirmation numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {application.firstName} {application.lastName}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Confirmation:</span>{' '}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-green-700 select-all">
                            {application.confirmationNumber}
                          </span>
                          <button
                            onClick={() => copyConfirmationNumber(application.confirmationNumber!)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy confirmation number"
                          >
                            <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{' '}
                        {application.submittedAt ? formatDate(application.submittedAt) : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Country:</span> {application.countryOfBirth}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {application.confirmationNumber && (
                      <>
                      
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadProofOfSubmission(application.id, application.confirmationNumber!)}
                          disabled={downloadingProof === application.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {downloadingProof === application.id ? 'Downloading...' : 'Download Proof'}
                        </Button>
                      </>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Start Your First DV Application</CardTitle>
            <CardDescription>
              You haven&apos;t created any applications yet. Start your first DV lottery application for yourself or a family member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/dv-form">
                <FileText className="h-4 w-4 mr-2" />
                Create First Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">New Application</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {canCreateNewApplication 
                ? `Start a new DV application. ${remainingDrafts} drafts remaining.`
                : `Draft limit reached (${MAX_DRAFT_APPLICATIONS}). Submit or delete existing drafts first.`
              }
            </p>
            {canCreateNewApplication ? (
              <Button asChild size="sm" className="w-full">
                <Link href="/dv-form">
                  <FileText className="h-4 w-4 mr-2" />
                  Start Application
                </Link>
              </Button>
            ) : (
              <Button size="sm" className="w-full" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Limit Reached
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Get assistance with your DV application process.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/help">
                View Help Center
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Check Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Check the official DV lottery results when available.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Results (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Update your account information and preferences.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/profile">
                Manage Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}