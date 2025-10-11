'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { withAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  User,
  Mail,
  MapPin,
  GraduationCap,
  Heart,
  Baby,
  FileText,
  Download,
  Check,
  X,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface ApplicationDetail {
  id: string
  // Personal Information
  givenName: string
  familyName: string
  middleName?: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  cityOfBirth: string
  countryOfBirth: string
  countryOfEligibility: string
  eligibilityClaimType?: string
  
  // Contact Information
  email: string
  phoneNumber?: string
  
  // Address Information
  inCareOf?: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  countryOfResidence: string
  
  // Education
  educationLevel: string
  
  // Marital Status
  maritalStatus: string
  spouseFamilyName?: string
  spouseGivenName?: string
  spouseMiddleName?: string
  spouseGender?: 'MALE' | 'FEMALE'
  spouseDateOfBirth?: string
  spouseCityOfBirth?: string
  spouseCountryOfBirth?: string
  
  // Children
  children: Array<{
    familyName: string
    givenName: string
    middleName?: string
    gender: 'MALE' | 'FEMALE'
    dateOfBirth: string
    cityOfBirth: string
    countryOfBirth: string
  }>
  
  // Application Status
  status: string
  paymentReference?: string
  confirmationNumber?: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
  
  // User Information
  user: {
    id: string
    email: string
    createdAt: string
  }
}

function ApplicationDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const applicationId = params.id as string

  useEffect(() => {
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/applications/${applicationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load application')
      }

      const result = await response.json()
      if (result.success && result.data) {
        setApplication(result.data)
      } else {
        throw new Error(result.error?.message || 'Failed to load application')
      }
    } catch (error) {
      console.error('Error loading application:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load application',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAction = async (action: 'approve' | 'reject') => {
    if (!application) return

    try {
      setActionLoading(action)
      const response = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          action
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }

      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Success',
          description: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        })
        // Reload application data
        await loadApplication()
      } else {
        throw new Error(result.error?.message || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update payment status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Payment Pending
          </Badge>
        )
      case 'PAYMENT_VERIFIED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Payment Verified
          </Badge>
        )
      case 'PAYMENT_REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Payment Rejected
          </Badge>
        )
      case 'APPLICATION_REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Application Rejected
          </Badge>
        )
      case 'SUBMITTED':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800">
            <Send className="h-3 w-3" />
            Submitted
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <p className="text-gray-600 mb-4">The requested application could not be found.</p>
          <Link
            href="/admin/applications"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  const canManagePayment = application.status === 'PAYMENT_PENDING' && application.paymentReference

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/applications"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Applications
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Application Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadApplication}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Application Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {application.givenName} {application.familyName}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Application ID: {application.id}
                </p>
                <p className="text-sm text-gray-600">
                  User: {application.user.email}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(application.status)}
                {canManagePayment && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePaymentAction('approve')}
                      disabled={actionLoading !== null}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === 'approve' ? (
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
                    <Button
                      variant="destructive"
                      onClick={() => handlePaymentAction('reject')}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === 'reject' ? (
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
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Given Name</label>
                      <p className="text-sm text-gray-900">{application.givenName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Family Name</label>
                      <p className="text-sm text-gray-900">{application.familyName}</p>
                    </div>
                    {application.middleName && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Middle Name</label>
                        <p className="text-sm text-gray-900">{application.middleName}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-sm text-gray-900">{application.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-sm text-gray-900">{formatDate(application.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">City of Birth</label>
                      <p className="text-sm text-gray-900">{application.cityOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Country of Birth</label>
                      <p className="text-sm text-gray-900">{application.countryOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Country of Eligibility</label>
                      <p className="text-sm text-gray-900">{application.countryOfEligibility}</p>
                    </div>
                    {application.eligibilityClaimType && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Eligibility Claim Type</label>
                        <p className="text-sm text-gray-900">{application.eligibilityClaimType}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{application.email}</p>
                    </div>
                    {application.phoneNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="text-sm text-gray-900">{application.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Mailing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {application.inCareOf && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">In Care Of</label>
                        <p className="text-sm text-gray-900">{application.inCareOf}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                      <p className="text-sm text-gray-900">{application.addressLine1}</p>
                    </div>
                    {application.addressLine2 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                        <p className="text-sm text-gray-900">{application.addressLine2}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-sm text-gray-900">{application.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">State/Province</label>
                        <p className="text-sm text-gray-900">{application.stateProvince}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Postal Code</label>
                        <p className="text-sm text-gray-900">{application.postalCode}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        <p className="text-sm text-gray-900">{application.country}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country of Residence</label>
                        <p className="text-sm text-gray-900">{application.countryOfResidence}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education Level</label>
                    <p className="text-sm text-gray-900">{application.educationLevel}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Marital Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Marital Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Marital Status</label>
                    <p className="text-sm text-gray-900">{application.maritalStatus}</p>
                  </div>
                  
                  {application.maritalStatus === 'MARRIED' && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Spouse Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {application.spouseGivenName && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse Given Name</label>
                            <p className="text-sm text-gray-900">{application.spouseGivenName}</p>
                          </div>
                        )}
                        {application.spouseFamilyName && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse Family Name</label>
                            <p className="text-sm text-gray-900">{application.spouseFamilyName}</p>
                          </div>
                        )}
                        {application.spouseMiddleName && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse Middle Name</label>
                            <p className="text-sm text-gray-900">{application.spouseMiddleName}</p>
                          </div>
                        )}
                        {application.spouseGender && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse Gender</label>
                            <p className="text-sm text-gray-900">{application.spouseGender}</p>
                          </div>
                        )}
                        {application.spouseDateOfBirth && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse Date of Birth</label>
                            <p className="text-sm text-gray-900">{formatDate(application.spouseDateOfBirth)}</p>
                          </div>
                        )}
                        {application.spouseCityOfBirth && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse City of Birth</label>
                            <p className="text-sm text-gray-900">{application.spouseCityOfBirth}</p>
                          </div>
                        )}
                        {application.spouseCountryOfBirth && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Spouse Country of Birth</label>
                            <p className="text-sm text-gray-900">{application.spouseCountryOfBirth}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Children */}
              {application.children && application.children.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Baby className="h-5 w-5" />
                      Children ({application.children.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {application.children.map((child, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Child {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Given Name</label>
                              <p className="text-sm text-gray-900">{child.givenName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Family Name</label>
                              <p className="text-sm text-gray-900">{child.familyName}</p>
                            </div>
                            {child.middleName && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Middle Name</label>
                                <p className="text-sm text-gray-900">{child.middleName}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium text-gray-500">Gender</label>
                              <p className="text-sm text-gray-900">{child.gender}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                              <p className="text-sm text-gray-900">{formatDate(child.dateOfBirth)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">City of Birth</label>
                              <p className="text-sm text-gray-900">{child.cityOfBirth}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Country of Birth</label>
                              <p className="text-sm text-gray-900">{child.countryOfBirth}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Status</label>
                    <div className="mt-1">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                  
                  {application.paymentReference && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Reference</label>
                      <p className="text-sm font-mono text-gray-900">{application.paymentReference}</p>
                    </div>
                  )}
                  
                  {application.confirmationNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">DV Confirmation Number</label>
                      <p className="text-sm font-mono text-green-600">{application.confirmationNumber}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">{formatDateTime(application.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900">{formatDateTime(application.updatedAt)}</p>
                  </div>
                  
                  {application.submittedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Submitted At</label>
                      <p className="text-sm text-gray-900">{formatDateTime(application.submittedAt)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{application.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="text-sm font-mono text-gray-900">{application.user.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Created</label>
                    <p className="text-sm text-gray-900">{formatDateTime(application.user.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {application.confirmationNumber && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // This would trigger a download of the proof of submission
                        window.open(`/api/applications/${application.id}/proof`, '_blank')
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Proof of Submission
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default withAuth(ApplicationDetailPage, { requireAdmin: true })