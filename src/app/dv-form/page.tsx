'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MultiStepForm } from '@/components/dv-form/multi-step-form'
import { FormStepData } from '@/lib/types/application'
import { Toaster } from '@/components/ui/toaster'

export default function DVFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // No draft functionality - each form session is independent

  const handleComplete = async (data: FormStepData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      console.log('Application completed:', data)
      // Show success message briefly then redirect
      alert('Application submitted successfully! Redirecting to dashboard...')
      
      // Redirect to dashboard after successful submission
      router.push('/dashboard')
    } catch (error) {
      console.error('Submission failed:', error)
      setError('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DV Lottery Application</h1>
          <p className="text-gray-600 mt-2">
            Complete a Diversity Visa lottery application. You can submit multiple applications for different family members.
          </p>
        </div>
      </div>



      {/* Legal Disclaimer Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-yellow-800">
              <span className="font-semibold">Important:</span> This is not a government service.
              You can submit applications for multiple eligible family members. Each application requires a separate 399 ETB service fee (non-refundable after submission).
            </div>
          </div>
        </div>
      </div>



      {error && (
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="py-8">
        <MultiStepForm
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>

      <Toaster />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Application</h3>
              <p className="text-gray-600">Please wait while we process your application...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}