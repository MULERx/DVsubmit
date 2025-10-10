'use client'

import { useState } from 'react'
import { MultiStepForm } from '@/components/dv-form/multi-step-form'
import { FormStepData } from '@/lib/types/application'
import { Toaster } from '@/components/ui/toaster'

export default function DVFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (data: FormStepData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      console.log('Application completed:', data)
      // The actual submission is handled by the useApplicationForm hook
      alert('Application submitted successfully!')
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
          <h1 className="text-3xl font-bold text-gray-900">DV Lottery Application</h1>
          <p className="text-gray-600 mt-2">
            Complete your Diversity Visa lottery application with our guided process.
          </p>
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