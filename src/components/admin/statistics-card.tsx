'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface StatisticsCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  color: 'indigo' | 'orange' | 'red' | 'yellow' | 'green'
  href?: string
  isLoading?: boolean
  className?: string
}

const colorClasses = {
  indigo: 'text-indigo-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
  green: 'text-green-600'
}

export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  href,
  isLoading = false,
  className
}: StatisticsCardProps) {
  const cardContent = (
    <Card className={cn(
      'relative overflow-hidden transition-shadow cursor-pointer',
      href && 'hover:shadow-lg',
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn(
              'text-2xl font-bold',
              colorClasses[color],
              isLoading && 'animate-pulse'
            )}>
              {isLoading ? '...' : value}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {description}
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
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}