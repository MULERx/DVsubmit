'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import Link from 'next/link'

interface DashboardHeaderProps {
  userEmail?: string
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
            Welcome back, {userEmail}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage DV lottery applications for yourself and family members.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dv-form">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            New Application
          </Link>
        </Button>
      </div>
    </div>
  )
}