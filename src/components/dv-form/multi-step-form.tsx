'use client'

import { useCallback } from 'react'
import { FormStep, FormStepData, PersonalInfo, MailingAddress, ContactInfo, Education, MaritalStatusInfo, Children, ApplicationRecord } from '@/lib/types/application'
import { FormStepNavigation } from './form-step-navigation'
import { PersonalInfoForm } from './personal-info-form'
import { MailingAddressForm } from './mailing-address-form'
import { ContactInfoForm } from './contact-info-form'
import { EducationForm } from './education-form'
import { MaritalStatusForm } from './marital-status-form'
import { ChildrenForm } from './children-form'
import { PhotoUploadForm } from './photo-upload-form'
import { ReviewForm } from './review-form'
import { useApplicationSubmission, useApplicationUpdate, transformFormDataForSubmission } from '@/hooks/use-application-mutations'
import { useFormSteps } from '@/hooks/use-form-steps'
import { useFormData } from '@/hooks/use-form-data'

interface MultiStepFormProps {
  onComplete?: (data: FormStepData) => Promise<void>
  onError?: (error: string) => void
  existingApplication?: ApplicationRecord | null
}

export function MultiStepForm({
  onComplete,
  onError,
  existingApplication
}: MultiStepFormProps) {
  // Custom hooks for form management
  const { formData, updateStepData } = useFormData(existingApplication)
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    getCompletedSteps
  } = useFormSteps()

  // TanStack Query mutations
  const applicationSubmission = useApplicationSubmission()
  const applicationUpdate = useApplicationUpdate()

  const isLoading = applicationSubmission.isPending || applicationUpdate.isPending
  const completedSteps = getCompletedSteps(formData)

  // Form validation helper
  const validateFormData = (data: Partial<FormStepData>) => {
    // Check for required steps
    if (!data.personal || !data.address || !data.contact || !data.education || !data.marital) {
      const missingSteps = []
      if (!data.personal) missingSteps.push('Personal Information')
      if (!data.address) missingSteps.push('Mailing Address')
      if (!data.contact) missingSteps.push('Contact Information')
      if (!data.education) missingSteps.push('Education')
      if (!data.marital) missingSteps.push('Marital Status')

      return {
        isValid: false,
        error: `Missing required form data: ${missingSteps.join(', ')}. Please complete all steps.`
      }
    }

    // Check for required fields within each step
    const requiredFields = [
      { field: data.personal.familyName, name: 'Family Name' },
      { field: data.personal.givenName, name: 'Given Name' },
      { field: data.personal.gender, name: 'Gender' },
      { field: data.personal.dateOfBirth, name: 'Date of Birth' },
      { field: data.personal.cityOfBirth, name: 'City of Birth' },
      { field: data.personal.countryOfBirth, name: 'Country of Birth' },
      { field: data.personal.countryOfEligibility, name: 'Country of Eligibility' },
      { field: data.address.addressLine1, name: 'Address Line 1' },
      { field: data.address.city, name: 'City' },
      { field: data.address.stateProvince, name: 'State/Province' },
      { field: data.address.postalCode, name: 'Postal Code' },
      { field: data.address.country, name: 'Country' },
      { field: data.address.countryOfResidence, name: 'Country of Residence' },
      { field: data.contact.email, name: 'Email' },
      { field: data.education.educationLevel, name: 'Education Level' },
      { field: data.marital.maritalStatus, name: 'Marital Status' },
    ]

    const missingFields = requiredFields.filter(({ field }) => !field || field.trim() === '')
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Missing required fields: ${missingFields.map(f => f.name).join(', ')}`
      }
    }

    return { isValid: true }
  }

  // Enhanced step navigation
  const handleGoToStep = useCallback((step: FormStep) => {
    goToStep(step, completedSteps)
  }, [goToStep, completedSteps])

  // Step submission handlers
  const handlePersonalInfoSubmit = useCallback((data: PersonalInfo) => {
    updateStepData('personal', data)
  }, [updateStepData])

  const handleMailingAddressSubmit = useCallback((data: MailingAddress) => {
    updateStepData('address', data)
  }, [updateStepData])

  const handleContactInfoSubmit = useCallback((data: ContactInfo) => {
    updateStepData('contact', data)
  }, [updateStepData])

  const handleEducationSubmit = useCallback((data: Education) => {
    updateStepData('education', data)
  }, [updateStepData])

  const handleMaritalStatusSubmit = useCallback((data: MaritalStatusInfo) => {
    updateStepData('marital', data)
  }, [updateStepData])

  const handleChildrenSubmit = useCallback((data: Children) => {
    updateStepData('children', data)
  }, [updateStepData])

  const handlePhotoUploadSubmit = useCallback((data: { file: File; preview: string }) => {
    updateStepData('photo', data)
  }, [updateStepData])



  // Handle final submission with transaction number
  const handleFinalSubmit = useCallback(async (transactionNumber: string) => {
    try {
      // Update form data with the transaction number as payment reference
      const updatedFormData = {
        ...formData,
        payment: {
          paymentReference: transactionNumber
        }
      }
      
      console.log('Form data before transformation:', updatedFormData)

      // Validate form completeness
      const validationResult = validateFormData(formData)
      if (!validationResult.isValid) {
        throw new Error(validationResult.error)
      }

      // Transform and submit
      const applicationData = transformFormDataForSubmission(updatedFormData as FormStepData)
      console.log('Transformed application data:', applicationData)

      const isEditing = !!existingApplication

      if (isEditing) {
        const result = await applicationUpdate.mutateAsync({
          id: existingApplication.id,
          applicationData
        })

        if (result.success && onComplete) {
          await onComplete(updatedFormData as FormStepData)
        }
      } else {
        const result = await applicationSubmission.mutateAsync(applicationData)

        if (result.success && onComplete) {
          await onComplete(updatedFormData as FormStepData)
        }
      }
    } catch (error) {
      console.error('Submission error:', error)
      if (onError) {
        onError(error instanceof Error ? error.message : 'Submission failed')
      }
    }
  }, [formData, existingApplication, applicationSubmission, applicationUpdate, onComplete, onError])

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoForm
            initialData={formData.personal}
            onSubmit={handlePersonalInfoSubmit}
            onNext={goToNextStep}
            isLoading={isLoading}
          />
        )

      case 'address':
        return (
          <MailingAddressForm
            initialData={formData.address}
            onSubmit={handleMailingAddressSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
          />
        )

      case 'contact':
        return (
          <ContactInfoForm
            initialData={formData.contact}
            onSubmit={handleContactInfoSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
          />
        )

      case 'education':
        return (
          <EducationForm
            initialData={formData.education}
            onSubmit={handleEducationSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
          />
        )

      case 'marital':
        return (
          <MaritalStatusForm
            initialData={formData.marital}
            onSubmit={handleMaritalStatusSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
          />
        )

      case 'children':
        return (
          <ChildrenForm
            initialData={formData.children}
            onSubmit={handleChildrenSubmit}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
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
            isLoading={isLoading}
          />
        )

      case 'review':
        return (
          <ReviewForm
            formData={formData as FormStepData}
            onSubmit={handleFinalSubmit}
            onEdit={(step) => handleGoToStep(step as FormStep)}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormStepNavigation
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleGoToStep}
      />

      <div className="mb-4">
        <div className="text-sm text-gray-500">
          Complete all steps to submit your application. Your data is only saved when you submit the final form.
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        {renderCurrentStep()}
      </div>
    </div>
  )
}