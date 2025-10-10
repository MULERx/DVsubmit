'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface FormLockNoticeProps {
  paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'
  className?: string
}

export function FormLockNotice({ paymentStatus, className = '' }: FormLockNoticeProps) {
  const getNoticeContent = () => {
    switch (paymentStatus) {
      case 'VERIFIED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: 'Application Locked - Payment Verified',
          description: 'Your payment has been verified and your application is now locked to prevent changes. You can proceed to review and submit your application.',
          bgColor: 'bg-green-50',
          borderColor: 'border-l-green-500'
        }
      case 'PENDING':
        return {
          icon: <Lock className="h-5 w-5 text-yellow-600" />,
          title: 'Application Locked - Payment Pending',
          description: 'Your application is temporarily locked while we verify your payment. You cannot make changes until payment verification is complete.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-l-yellow-500'
        }
      case 'REJECTED':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          title: 'Payment Rejected - Application Unlocked',
          description: 'Your payment could not be verified. Your application is now unlocked so you can submit a new payment reference.',
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500'
        }
      default:
        return null
    }
  }

  const content = getNoticeContent()
  if (!content) return null

  return (
    <Card className={`border-l-4 ${content.borderColor} ${content.bgColor} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {content.icon}
          {content.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {content.description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}