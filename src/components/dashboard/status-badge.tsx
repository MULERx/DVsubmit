'use client'

import { Badge } from '@/components/ui/badge'
import { ApplicationStatus } from '@/lib/types/application'
import { Clock, CheckCircle, XCircle, Upload } from 'lucide-react'

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    PAYMENT_PENDING: { variant: 'outline' as const, label: 'Payment Verifying', icon: Clock },
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