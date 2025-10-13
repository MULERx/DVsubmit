'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export function EmptyState() {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Start Your First DV Application</CardTitle>
        <CardDescription className="text-sm">
          You haven&apos;t created any applications yet. Start your first DV lottery application for yourself or a family member.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="sm" className="sm:size-lg w-full sm:w-auto">
          <Link href="/dv-form">
            <FileText className="h-4 w-4 mr-2" />
            Create First Application
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}