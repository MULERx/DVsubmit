'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, FileText } from 'lucide-react'
import { ApplicationRecord } from '@/lib/types/application'

interface ApplicationsOverviewProps {
  applications: ApplicationRecord[]
}

export function ApplicationsOverview({ applications }: ApplicationsOverviewProps) {
  const pendingApplications = applications.filter(app =>
    app.status === 'PAYMENT_PENDING' || 
    app.status === 'PAYMENT_VERIFIED' || 
    app.status === 'PAYMENT_REJECTED' || 
    app.status === 'APPLICATION_REJECTED'
  )
  
  const submittedApplications = applications.filter(app =>
    app.status === 'SUBMITTED'
  )

  const overviewCards = [
    {
      title: 'Pending',
      count: pendingApplications.length,
      description: 'Awaiting payment/processing',
      icon: Clock,
      borderColor: 'border-l-yellow-400',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      countColor: 'text-yellow-600'
    },
    {
      title: 'Submitted',
      count: submittedApplications.length,
      description: 'Successfully submitted',
      icon: CheckCircle,
      borderColor: 'border-l-green-500',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      countColor: 'text-green-600'
    },
    {
      title: 'Total',
      count: applications.length,
      description: 'All applications',
      icon: FileText,
      borderColor: 'border-l-blue-500',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      countColor: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
      {overviewCards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className={`border-l-4 ${card.borderColor} hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-0">
              <CardTitle className="text-base sm:text-lg flex items-center gap-3">
                <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                 <div className={`text-2xl sm:text-3xl font-bold ${card.countColor} mb-1`}>
                {card.count}
              </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
             
              <p className="text-xs sm:text-sm text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}