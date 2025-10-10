'use client'

import { useState } from 'react'
import { AlertTriangle, X, Info, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LegalBannerProps {
  variant?: 'warning' | 'info' | 'disclaimer'
  dismissible?: boolean
  className?: string
  onDismiss?: () => void
}

export function LegalBanner({ 
  variant = 'disclaimer',
  dismissible = false,
  className = '',
  onDismiss
}: LegalBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          containerClass: 'bg-red-50 border-red-200 text-red-800',
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          title: 'Important Warning',
          message: 'This is not a government service. Selection in the DV lottery is not guaranteed.'
        }
      case 'info':
        return {
          containerClass: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          title: 'Service Information',
          message: 'We provide DV lottery assistance services. We are not affiliated with the U.S. Government.'
        }
      case 'disclaimer':
        return {
          containerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: <Shield className="h-5 w-5 text-yellow-600" />,
          title: 'Legal Disclaimer',
          message: 'Private service • Not government affiliated • No selection guarantee • 399 ETB service fee'
        }
      default:
        return {
          containerClass: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: <Info className="h-5 w-5 text-gray-600" />,
          title: 'Notice',
          message: 'Please review our terms and conditions.'
        }
    }
  }

  const variantConfig = getVariantStyles()

  return (
    <div className={`border rounded-lg p-4 ${variantConfig.containerClass} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {variantConfig.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            {variantConfig.title}
          </h3>
          <p className="text-sm">
            {variantConfig.message}
          </p>
        </div>
        
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Specific banner components for different contexts
export function FirstVisitBanner({ className = '', onDismiss }: { className?: string; onDismiss?: () => void }) {
  return (
    <LegalBanner
      variant="warning"
      dismissible={true}
      className={className}
      onDismiss={onDismiss}
    />
  )
}

export function SubmissionPageBanner({ className = '' }: { className?: string }) {
  return (
    <LegalBanner
      variant="disclaimer"
      dismissible={false}
      className={className}
    />
  )
}

export function PaymentPageBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <LegalBanner
        variant="warning"
        dismissible={false}
      />
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800">
            <p className="font-semibold mb-1">Before Payment Reminder</p>
            <p>
              The 399 ETB service fee is non-refundable once your application is submitted. 
              Ensure all information is accurate before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}