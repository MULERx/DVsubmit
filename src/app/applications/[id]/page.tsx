'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { ApplicationRecord } from '@/lib/types/application'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Camera
} from 'lucide-react'
import Link from 'next/link'

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [application, setApplication] = useState<ApplicationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingProof, setDownloadingProof] = useState(false)

  const applicationId = params.id as string

  useEffect(() => {
    if (user && applicationId) {
      loadApplication()
    }
  }, [user, applicationId])

  const loadApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Not Found',
            description: 'Application not found or you do not have access to it',
            variant: 'destructive',
          })
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to load application')
      }

      const data = await response.json()
      if (data.success && data.data) {
        setApplication(data.data)
      } else {
        throw new Error(data.error?.message || 'Failed to load application')
      }
    } catch (error) {
      console.error('Error loading application:', error)
      toast({
        title: 'Error',
        description: 'Failed to load application details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadProofOfSubmission = async () => {
    if (!application?.confirmationNumber) return

    try {
      setDownloadingProof(true)
      
      const response = await fetch(`/api/applications/${application.id}/proof`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to generate proof of submission')
      }

      const html = await response.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `DV-Submission-Proof-${application.confirmationNumber}.html`
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
      setDownloadingProof(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft', icon: FileText },
      PAYMENT_PENDING: { variant: 'outline' as const, label: 'Payment Pending', icon: Clock },
      PAYMENT_VERIFIED: { variant: 'default' as const, label: 'Payment Verified', icon: CheckCircle },
      SUBMITTED: { variant: 'default' as const, label: 'Submitted to DV System', icon: Upload },
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

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'outline' as const, label: 'Pending Verification', icon: Clock },
      VERIFIED: { variant: 'default' as const, label: 'Verified', icon: CheckCircle },
      REJECTED: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      REFUNDED: { variant: 'secondary' as const, label: 'Refunded', icon: AlertCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <p className="text-gray-600 mb-4">The application you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Application Details
              </h1>
              <p className="text-gray-600 mt-2">
                Application ID: {application.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}
              {application.confirmationNumber && (
                <Button
                  onClick={downloadProofOfSubmission}
                  disabled={downloadingProof}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingProof ? 'Downloading...' : 'Download Proof'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Number (if available) */}
        {application.confirmationNumber && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                DV Lottery Confirmation Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-green-600 mb-2">
                  {application.confirmationNumber}
                </div>
                <p className="text-green-700 text-sm">
                  Keep this number safe - you'll need it to check your results on the official DV lottery website
                </p>
                {application.submittedAt && (
                  <p className="text-green-600 text-sm mt-2">
                    Submitted on {formatDate(application.submittedAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-gray-900">{application.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900">{application.lastName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(application.dateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Country of Birth</label>
                <p className="text-gray-900">{application.countryOfBirth}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Country of Eligibility</label>
                <p className="text-gray-900">{application.countryOfEligibility}</p>
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
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-gray-900">{application.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <p className="text-gray-900">{application.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                <div className="text-gray-900">
                  {application.address && typeof application.address === 'object' && (
                    <div>
                      <p>{(application.address as any).street}</p>
                      <p>
                        {(application.address as any).city}, {(application.address as any).state} {(application.address as any).postalCode}
                      </p>
                      <p>{(application.address as any).country}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education & Work */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education & Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Education Level
                </label>
                <p className="text-gray-900">{application.education}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  Occupation
                </label>
                <p className="text-gray-900">{application.occupation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Photo & Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo & Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Photo Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {application.photoValidated ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Validated
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Pending Validation
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Status</label>
                <div className="mt-1">
                  {getPaymentStatusBadge(application.paymentStatus)}
                </div>
                {application.paymentReference && (
                  <p className="text-sm text-gray-600 mt-1">
                    Reference: {application.paymentReference}
                  </p>
                )}
                {application.paymentVerifiedAt && (
                  <p className="text-sm text-gray-600 mt-1">
                    Verified: {formatDate(application.paymentVerifiedAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>
              Track the progress of your DV lottery application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Application Created</p>
                  <p className="text-sm text-gray-500">{formatDate(application.createdAt)}</p>
                </div>
              </div>
              
              {application.paymentVerifiedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Payment Verified</p>
                    <p className="text-sm text-gray-500">{formatDate(application.paymentVerifiedAt)}</p>
                  </div>
                </div>
              )}
              
              {application.submittedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Submitted to DV System</p>
                    <p className="text-sm text-gray-500">{formatDate(application.submittedAt)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-500">Results Available</p>
                  <p className="text-sm text-gray-500">Check official DV lottery website when results are announced</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-800 space-y-2">
              <p className="font-medium">This is not a government service.</p>
              <p className="text-sm">
                DVSubmit is a private service that assists with DV lottery applications. 
                Selection in the DV lottery is not guaranteed. For official results and information, 
                please visit the U.S. Department of State's official DV lottery website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}