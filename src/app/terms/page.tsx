import { TermsOfService } from '@/components/legal/terms-of-service'
import { LegalDisclaimer } from '@/components/legal/legal-disclaimer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Terms of Service & Legal Disclaimer
          </h1>
          <p className="text-gray-600 mt-2">
            Please read these terms carefully before using our DV lottery assistance service.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="mb-8">
          <LegalDisclaimer variant="full" />
        </div>

        {/* Terms of Service */}
        <div className="mb-8">
          <TermsOfService />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-8">
          <p>
            If you have questions about these terms, please contact our support team.
          </p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}