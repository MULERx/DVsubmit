'use client'

import { useStatistics } from '@/hooks/use-statistics'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  CheckCircle, 
  Clock,
  RefreshCw,
  AlertCircle,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function QuickStatistics() {
  const { data: statistics, isLoading, error, refetch, isRefetching } = useStatistics()

  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Statistics</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load statistics</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Statistics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {/* 1. Total Submitted Applications */}
        <Link href="/admin/applications" className="block">
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold text-indigo-600 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : statistics?.totalSubmittedApplications || 0}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total Applications
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    All submitted applications
                  </div>
                </div>
              </div>
            </CardContent>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </Link>

        {/* 2. Pending Payment Verify */}
        <Link href="/admin/applications?type=pendingPayment" className="block">
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold text-orange-600 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : statistics?.pendingPaymentVerify || 0}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pending Payment Verify
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Awaiting payment verification
                  </div>
                </div>
              </div>
            </CardContent>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </Link>

        {/* 3. Rejected Payments */}
        <Link href="/admin/applications?type=paymentRejected" className="block">
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold text-red-600 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : statistics?.rejectedPayments || 0}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Rejected Payments
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Payment verification failed
                  </div>
                </div>
              </div>
            </CardContent>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </Link>

        {/* 4. Rejected Applications */}
        <Link href="/admin/applications?type=applicationRejected" className="block">
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold text-red-600 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : statistics?.rejectedApplications || 0}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Rejected Applications
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Need corrections by users
                  </div>
                </div>
              </div>
            </CardContent>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </Link>

        {/* 5. Pending Review and Submit */}
        <Link href="/admin/applications?type=pendingReview" className="block">
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold text-yellow-600 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : statistics?.pendingReviewAndSubmit || 0}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Review & Submit
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Ready for DV submission
                  </div>
                </div>
              </div>
            </CardContent>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </Link>

        {/* 6. Submitted to DV */}
        <Link href="/admin/applications?type=submitted" className="block">
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold text-green-600 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : statistics?.submittedToDV || 0}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Submitted to DV
                  </div>
                  {statistics && statistics.totalSubmittedApplications > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.round((statistics.submittedToDV / statistics.totalSubmittedApplications) * 100)}% completion rate
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </Link>
      </div>
    </div>
  )
}