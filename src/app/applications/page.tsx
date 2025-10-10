'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ApplicationService } from '@/lib/services/application-service'
import { ApplicationRecord } from '@/lib/types/application'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft', icon: FileText },
      PAYMENT_PENDING: { variant: 'outline' as const, label: 'Payment Pending', icon: Clock },
      PAYMENT_VERIFIED: { variant: 'default' as const, label: 'Payment Verified', icon: CheckCircle },
      SUBMITTED: { variant: 'default' as const, label: 'Submitted', icon: CheckCircle },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed', icon: CheckCircle },
      EXPIRED: { variant: 'destructive' as const, label: 'Expired', icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const deleteApplication = async (applicationId: string, applicantName: string) => {
    if (!confirm(`Are you sure you want to delete the application for ${applicantName}? This action cannot be undone.`)) {
      return
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-2">
                View and manage DV lottery applications for yourself and family members
              </p>
            </div>
            <Button asChild>
              <Link href="/dv-form?new=true">
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </Button>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Applications Found</CardTitle>
              <CardDescription>
                You haven&apos;t created any DV lottery applications yet. You can create applications for yourself and eligible family members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dv-form?new=true">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Application
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {application.firstName} {application.lastName}
                        {getStatusBadge(application.status)}
                      </CardTitle>
                      <CardDescription>
                        Application ID: {application.id}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last updated</p>
                      <p className="text-sm font-medium">{formatDate(application.updatedAt)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Personal Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Date of Birth:</span> {formatDate(application.dateOfBirth)}</p>
                        <p><span className="text-gray-500">Country of Birth:</span> {application.countryOfBirth}</p>
                        <p><span className="text-gray-500">Email:</span> {application.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Payment:</span> {application.paymentStatus}</p>
                        <p><span className="text-gray-500">Photo:</span> {application.photoValidated ? 'Validated' : 'Pending'}</p>
                        <p><span className="text-gray-500">Created:</span> {formatDate(application.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                      <div className="space-y-1 text-sm">
                        {application.confirmationNumber ? (
                          <>
                            <p><span className="text-gray-500">Confirmation:</span> {application.confirmationNumber}</p>
                            <p><span className="text-gray-500">Submitted:</span> {application.submittedAt ? formatDate(application.submittedAt) : 'N/A'}</p>
                          </>
                        ) : (
                          <p className="text-gray-500">Not yet submitted</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" asChild>
                      <Link href={`/applications/${application.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    
                    {/* Edit and Delete options for non-submitted applications */}
                    {(application.status === 'DRAFT' || 
                      (application.status === 'PAYMENT_PENDING' && application.paymentStatus !== 'VERIFIED')) && (
                      <>
                        <Button asChild>
                          <Link href={`/dv-form?edit=${application.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            {application.status === 'DRAFT' ? 'Continue' : 'Edit'}
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => deleteApplication(application.id, `${application.firstName} ${application.lastName}`)}
                          disabled={deletingApplication === application.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingApplication === application.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}