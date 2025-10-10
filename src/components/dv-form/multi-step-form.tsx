'use client'

import { useState, useCallback } from 'react'
import { FormStep, FormStepData, PersonalInfo, ContactInfo, EducationWork, Payment } from '@/lib/types/application'
import { FormStepNavigation } from './form-step-navigation'
import { FormProgress } from './form-progress'
import { PersonalInfoForm } from './personal-info-form'
import { ContactInfoForm } from './contact-info-form'
import { EducationWorkForm } from './education-work-form'
import { PhotoUploadForm } from './photo-upload-form'
import { PaymentForm } from './payment-form'
import { ReviewForm } from './review-form'
import { FormLockNotice } from '@/components/ui/form-lock-notice'
import { useApplicationForm } from '@/hooks/use-application-form'

interface MultiStepFormProps {
  onComplete?: (data: FormStepData) => Promise<void>
  onError?: (error: string) => void
}

export function MultiStepForm({ 
  onComplete,
  onError
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    canSubmit: boolean
    hasDuplicate: boolean
    message: string
  } | null>(null)
  
  const {
    formData,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    paymentStatus,
    updateStepData,
    submitApplication,
    checkDuplicateSubmission,
    getStepCompletionStatus,
  } = useApplicationForm({
    onError,
  })

  const completedSteps = getStepCompletionStatus()

  // Handle step completion
  const handleStepComplete = useCallback((step: FormStep, data: any) => {
    updateStepData(step, data)
  }, [updateStepData])

  // Navigation functions
  const goToNextStep = useCallback(async () => {
    const steps: FormStep[] = ['personal', 'contact', 'education', 'photo', 'payment', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]
      
      // Check for duplicates when entering the review step
      if (nextStep === 'review') {
        const duplicateCheck = await checkDuplicateSubmission()
        if (duplicateCheck.success && duplicateCheck.data) {
          setDuplicateCheckResult(duplicateCheck.data)
        }
      }
      
      setCurrentStep(nextStep)
    }
  }, [currentStep, checkDuplicateSubmission])

  const goToPreviousStep = useCallback(() => {
    const steps: FormStep[] = ['personal', 'contact', 'education', 'photo', 'payment', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }, [currentStep])

  const goToStep = useCallback(async (step: FormStep) => {
    const steps: FormStep[] = ['personal', 'contact', 'education', 'photo', 'payment', 'review']
    const stepIndex = steps.indexOf(step)
    const currentIndex = steps.indexOf(currentStep)
    
    // Prevent navigation away from payment step if payment is pending
    if (currentStep === 'payment' && paymentStatus === 'PENDING' && step !== 'payment') {
      return
    }
    
    // Prevent navigation to previous steps if payment is verified (form locked)
    if (paymentStatus === 'VERIFIED' && stepIndex < steps.indexOf('payment') && currentStep !== step) {
      return
    }
    
    // Allow navigation to completed steps or the next immediate step
    if (completedSteps.includes(step) || stepIndex <= currentIndex + 1) {
      // Check for duplicates when entering the review step
      if (step === 'review') {
        const duplicateCheck = await checkDuplicateSubmission()
        if (duplicateCheck.success && duplicateCheck.data) {
          setDuplicateCheckResult(duplicateCheck.data)
        }
      }
      
      setCurrentStep(step)
    }
  }, [currentStep, completedSteps, paymentStatus, checkDuplicateSubmission])

  // Handle personal info submission
  const handlePersonalInfoSubmit = useCallback((data: PersonalInfo) => {
    handleStepComplete('personal', data)
  }, [handleStepComplete])

  // Handle contact info submission
  const handleContactInfoSubmit = useCallback((data: ContactInfo) => {
    handleStepComplete('contact', data)
  }, [handleStepComplete])

  // Handle education work submission
  const handleEducationWorkSubmit = useCallback((data: EducationWork) => {
    handleStepComplete('education', data)
  }, [handleStepComplete])

  // Handle photo upload submission
  const handlePhotoUploadSubmit = useCallback((data: { file: File; preview: string }) => {
    handleStepComplete('photo', data)
  }, [handleStepComplete])

  // Handle payment submission
  const handlePaymentSubmit = useCallback((data: Payment) => {
    handleStepComplete('payment', data)
  }, [handleStepComplete])

  // Check if form should be disabled (payment verified = form locked)
  const isFormDisabled = paymentStatus === 'VERIFIED'

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoForm
            initialData={formData.personal}
            onSubmit={handlePersonalInfoSubmit}
            onNext={goToNextStep}
            isLoading={isLoading || isSaving || isFormDisabled}
          />
        )
      
      case 'contact':
        return (
          <ContactInfoForm
            initialData={formData.contact}
            onSubmit={handleContactInfoSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading || isSaving || isFormDisabled}
          />
        )
      
      case 'education':
        return (
          <EducationWorkForm
            initialData={formData.education}
            onSubmit={handleEducationWorkSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading || isSaving || isFormDisabled}
          />
        )
      
      case 'photo':
        return (
          <PhotoUploadForm
            initialData={formData.photo}
            onNext={(data) => {
              handlePhotoUploadSubmit(data)
              goToNextStep()
            }}
            onPrevious={goToPreviousStep}
            isLoading={isLoading || isSaving || isFormDisabled}
          />
        )
      
      case 'payment':
        return (
          <PaymentForm
            initialData={formData.payment}
            onSubmit={handlePaymentSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading || isSaving}
            paymentStatus={paymentStatus}
          />
        )
      
      case 'review':
        return (
          <div className="space-y-6">
            {duplicateCheckResult && !duplicateCheckResult.canSubmit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Duplicate Submission Detected</h3>
                <p className="text-red-700 text-sm">{duplicateCheckResult.message}</p>
                <p className="text-red-600 text-sm mt-2">
                  You cannot submit another application until your current application is processed or expires.
                </p>
              </div>
            )}
            
            <ReviewForm
              formData={formData as FormStepData}
              onSubmit={async () => {
                const result = await submitApplication(formData as FormStepData)
                if (result && onComplete) {
                  await onComplete(formData as FormStepData)
                }
              }}
              onEdit={(step) => {
                setCurrentStep(step as FormStep)
              }}
              onPrevious={goToPreviousStep}
              isLoading={isLoading}
              hasValidationErrors={duplicateCheckResult ? !duplicateCheckResult.canSubmit : false}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormProgress currentStep={currentStep} completedSteps={completedSteps} />
      <FormStepNavigation 
        currentStep={currentStep} 
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />
      
      {/* Form Lock Notice */}
      {formData.payment?.paymentReference && paymentStatus !== 'REJECTED' && (
        <FormLockNotice paymentStatus={paymentStatus} className="mb-4" />
      )}

      {/* Save Status Indicator */}
      <div className="mb-4 text-right">
        {isSaving && (
          <span className="text-sm text-blue-600 flex items-center justify-end gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Saving...
          </span>
        )}
        {!isSaving && hasUnsavedChanges && (
          <span className="text-sm text-orange-600">Unsaved changes</span>
        )}
        {!isSaving && !hasUnsavedChanges && formData.personal && (
          <span className="text-sm text-green-600">All changes saved</span>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {renderCurrentStep()}
      </div>
    </div>
  )
}