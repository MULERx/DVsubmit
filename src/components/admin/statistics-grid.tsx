'use client'

import { Statistics } from '@/hooks/use-statistics'
import { StatisticsCard } from './statistics-card'
import { 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  CreditCard
} from 'lucide-react'

export interface StatisticsGridProps {
  statistics: Statistics | null
  isLoading: boolean
}

export function StatisticsGrid({ statistics, isLoading }: StatisticsGridProps) {
  const statisticsConfig = [
    {
      key: 'totalSubmittedApplications',
      title: 'Total Applications',
      description: 'All submitted applications',
      icon: FileText,
      color: 'indigo' as const,
      href: '/admin/applications'
    },
    {
      key: 'pendingPaymentVerify',
      title: 'Pending Payment Verify',
      description: 'Awaiting payment verification',
      icon: CreditCard,
      color: 'orange' as const,
      href: '/admin/applications?type=pendingPayment'
    },
    {
      key: 'rejectedPayments',
      title: 'Rejected Payments',
      description: 'Payment verification failed',
      icon: CreditCard,
      color: 'red' as const,
      href: '/admin/applications?type=paymentRejected'
    },
    {
      key: 'rejectedApplications',
      title: 'Rejected Applications',
      description: 'Need corrections by users',
      icon: AlertCircle,
      color: 'red' as const,
      href: '/admin/applications?type=applicationRejected'
    },
    {
      key: 'pendingReviewAndSubmit',
      title: 'Pending Review & Submit',
      description: 'Ready for DV submission',
      icon: Clock,
      color: 'yellow' as const,
      href: '/admin/applications?type=pendingReview'
    },
    {
      key: 'submittedToDV',
      title: 'Submitted to DV',
      description: 'Completed applications',
      icon: CheckCircle,
      color: 'green' as const,
      href: '/admin/applications?type=submitted'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {statisticsConfig.map((config) => {
        const value = statistics?.[config.key as keyof Statistics] || 0
        

        return (
          <StatisticsCard
            key={config.key}
            title={config.title}
            value={value}
            description={config.description}
            icon={config.icon}
            color={config.color}
            href={config.href}
            isLoading={isLoading}
          />
        )
      })}
    </div>
  )
}