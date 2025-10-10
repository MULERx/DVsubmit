'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ApplicationService } from '@/lib/services/application-service'
import { ApplicationRecord, ApplicationStatus, PaymentStatus } from '@/lib/types/application'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Upload,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface UserDashboardProps {
  className?: string
}

export function UserDashboard({ className }: UserDashboardProps) {
  const { user, userWithRole } = useAuth()
  const { toast } = useToast()
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingProof, setDownloadingProof] = useState<string | null>(null)

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getNextAction = (application: ApplicationRecord) => {
    switch (application.status) {
      case 'DRAFT':
        return {
          label: 'Continue Application',
          href: '/dv-form',
          variant: 'default' as const,
        }
      case 'PAYMENT_PENDING':
        return {
          label: 'View Payment Status',
          href: `/applications/${application.id}`,
          variant: 'outline' as const,
        }
      case 'PAYMENT_VERIFIED':
        return {
          label: 'View Application',
          href: `/applications/${application.id}`,
          variant: 'outline' as const,
        }
      case 'SUBMITTED':
      case 'CONFIRMED':
        return {
          label: 'View Details',
          href: `/applications/${application.id}`,
          variant: 'outline' as const,
        }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentApplication = applications.find(app => app.status !== 'EXPIRED')
  const submittedApplications = applications.filter(app => 
    app.status === 'SUBMITTED' || app.status === 'CONFIRMED'
  )

  return (
    <div className={className}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userWithRole?.dbUser?.email}</h1>
        <p className="text-gray-600 mt-2">
          Track your DV lottery application status and manage your submissions.
        </p>
      </div>

      {/* Current Application Status */}
      {currentApplication ? (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Application
                  {getStatusBadge(currentApplication.status)}
                </CardTitle>
                <CardDescription>
                  Application ID: {currentApplication.id}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium">{formatDate(currentApplication.updatedAt)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {currentApplication.firstName} {currentApplication.lastName}</p>
                  <p><span className="text-gray-500">Date of Birth:</span> {formatDate(currentApplication.dateOfBirth)}</p>
                  <p><span className="text-gray-500">Country of Birth:</span> {currentApplication.countryOfBirth}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
                <div className="space-y-2">
                  {getPaymentStatusBadge(currentApplication.paymentStatus)}
                  {currentApplication.paymentReference && (
                    <p className="text-sm">
                      <span className="text-gray-500">Reference:</span> {currentApplication.paymentReference}
                    </p>
                  )}
                  {currentApplication.paymentVerifiedAt && (
                    <p className="text-sm">
                      <span className="text-gray-500">Verified:</span> {formatDate(currentApplication.paymentVerifiedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Submission Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                <div className="space-y-2">
                  {currentApplication.confirmationNumber ? (
                    <div>
                      <p className="text-sm">
                        <span className="text-gray-500">Confirmation Number:</span>
                      </p>
                      <p className="font-mono text-lg font-bold text-green-600">
                        {currentApplication.confirmationNumber}
                      </p>
                      {currentApplication.submittedAt && (
                        <p className="text-sm text-gray-500">
                          Submitted: {formatDate(currentApplication.submittedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not yet submitted</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              {(() => {
                const nextAction = getNextAction(currentApplication)
                return nextAction ? (
                  <Button asChild variant={nextAction.variant}>
                    <Link href={nextAction.href}>
                      {nextAction.label}
                    </Link>
                  </Button>
                ) : null
              })()}
              
              {currentApplication.confirmationNumber && (
                <Button
                  variant="outline"
                  onClick={() => downloadProofOfSubmission(currentApplication.id, currentApplication.confirmationNumber!)}
                  disabled={downloadingProof === currentApplication.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingProof === currentApplication.id ? 'Downloading...' : 'Download Proof'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* No Current Application */
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Start Your DV Application</CardTitle>
            <CardDescription>
              You don't have any active applications. Start your DV lottery application now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dv-form">
                <FileText className="h-4 w-4 mr-2" />
                Start New Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submission History */}
      {submittedApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              Your previous DV lottery submissions and their confirmation details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedApplications.map((application) => (
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
                        <span className="font-medium">Confirmation:</span>{' '}
                        <span className="font-mono">{application.confirmationNumber}</span>
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/applications/${application.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {application.confirmationNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadProofOfSubmission(application.id, application.confirmationNumber!)}
                        disabled={downloadingProof === application.id}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {downloadingProof === application.id ? 'Downloading...' : 'Proof'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Get assistance with your DV application process.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/help">
                View Help Center
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Check the official DV lottery results when available.
            </p>
            <Button variant="outline" size="sm" disabled>
              Check Results (Coming Soon)
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
            <Button variant="outline" size="sm" asChild>
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