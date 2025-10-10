'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { PaymentService } from '@/lib/services/payment-service'

interface PaymentStatusProps {
  paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'
  paymentReference?: string
  verifiedAt?: Date | null
  verifiedBy?: string
  className?: string
}

export function PaymentStatus({
  paymentStatus,
  paymentReference,
  verifiedAt,
  verifiedBy,
  className = ''
}: PaymentStatusProps) {
  const statusMessage = PaymentService.getPaymentStatusMessage(paymentStatus)

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'REFUNDED':
        return <RefreshCw className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'VERIFIED':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'REFUNDED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refunded</Badge>
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  const getBorderColor = () => {
    switch (paymentStatus) {
      case 'VERIFIED':
        return 'border-l-green-500 bg-green-50'
      case 'REJECTED':
        return 'border-l-red-500 bg-red-50'
      case 'REFUNDED':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-yellow-500 bg-yellow-50'
    }
  }

  return (
    <Card className={`border-l-4 ${getBorderColor()} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            {statusMessage.title}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-sm">
          {statusMessage.description}
        </CardDescription>
      </CardHeader>
      
      {(paymentReference || verifiedAt) && (
        <CardContent className="pt-0 space-y-2">
          {paymentReference && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Payment Reference:</span>
              <span className="ml-2 font-mono text-gray-900">
                {PaymentService.formatPaymentReference(paymentReference)}
              </span>
            </div>
          )}
          
          {verifiedAt && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Verified:</span>
              <span className="ml-2 text-gray-900">
                {new Date(verifiedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          
          {verifiedBy && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Verified by:</span>
              <span className="ml-2 text-gray-900">{verifiedBy}</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}