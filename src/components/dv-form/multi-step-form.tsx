'use client'

import { useState, useCallback, useEffect } from 'react'
import { FormStep, FormStepData, PersonalInfo, MailingAddress, ContactInfo, Education, MaritalStatusInfo, Children, Payment, ApplicationRecord } from '@/lib/types/application'
import { FormStepNavigation } from './form-step-navigation'
import { PersonalInfoForm } from './personal-info-form'
import { MailingAddressForm } from './mailing-address-form'
import { ContactInfoForm } from './contact-info-form'
import { EducationForm } from './education-form'
import { MaritalStatusForm } from './marital-status-form'
import { ChildrenForm } from './children-form'
import { PhotoUploadForm } from './photo-upload-form'

import { ReviewForm } from './review-form'

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
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')


  const [formData, setFormData] = useState<Partial<FormStepData>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form data with existing application data
  useEffect(() => {
    if (existingApplication) {
      const transformedData: Partial<FormStepData> = {
        personal: {
          familyName: existingApplication.familyName,
          givenName: existingApplication.givenName,
          middleName: existingApplication.middleName || '',
          gender: existingApplication.gender,
          dateOfBirth: typeof existingApplication.dateOfBirth === 'string'
            ? existingApplication.dateOfBirth
            : existingApplication.dateOfBirth.toISOString().split('T')[0],
          cityOfBirth: existingApplication.cityOfBirth,
          countryOfBirth: existingApplication.countryOfBirth,
          countryOfEligibility: existingApplication.countryOfEligibility,
          eligibilityClaimType: existingApplication.eligibilityClaimType || undefined,
        },
        address: {
          inCareOf: existingApplication.inCareOf || '',
          addressLine1: existingApplication.addressLine1,
          addressLine2: existingApplication.addressLine2 || '',
          city: existingApplication.city,
          stateProvince: existingApplication.stateProvince,
          postalCode: existingApplication.postalCode,
          country: existingApplication.country,
          countryOfResidence: existingApplication.countryOfResidence,
        },
        contact: {
          phoneNumber: existingApplication.phoneNumber || '',
          email: existingApplication.email,
        },
        education: {
          educationLevel: existingApplication.educationLevel,
        },
        marital: {
          maritalStatus: existingApplication.maritalStatus,
          spouseFamilyName: existingApplication.spouseFamilyName || '',
          spouseGivenName: existingApplication.spouseGivenName || '',
          spouseMiddleName: existingApplication.spouseMiddleName || '',
          spouseGender: existingApplication.spouseGender || undefined,
          spouseDateOfBirth: existingApplication.spouseDateOfBirth
            ? (typeof existingApplication.spouseDateOfBirth === 'string'
              ? existingApplication.spouseDateOfBirth
              : existingApplication.spouseDateOfBirth.toISOString().split('T')[0])
            : '',
          spouseCityOfBirth: existingApplication.spouseCityOfBirth || '',
          spouseCountryOfBirth: existingApplication.spouseCountryOfBirth || '',
        },
        children: {
          children: (existingApplication.children || []).map(child => ({
            ...child,
            dateOfBirth: typeof child.dateOfBirth === 'string'
              ? child.dateOfBirth
              : child.dateOfBirth.toISOString().split('T')[0]
          })),
        },
        // Note: Photo data would need to be handled separately if needed
      }
      setFormData(transformedData)
    }
  }, [existingApplication])

  // Track completed steps based on form data
  const getCompletedSteps = (): FormStep[] => {
    const completed: FormStep[] = []
    if (formData.personal) completed.push('personal')
    if (formData.address) completed.push('address')
    if (formData.contact) completed.push('contact')
    if (formData.education) completed.push('education')
    if (formData.marital) completed.push('marital')
    if (formData.children !== undefined) completed.push('children')
    if (formData.photo) completed.push('photo')

    return completed
  }

  const completedSteps = getCompletedSteps()

  // Handle step completion - just store in local state
  const handleStepComplete = useCallback((step: FormStep, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }))
  }, [])

  // Navigation functions
  const goToNextStep = useCallback(() => {
    const steps: FormStep[] = ['personal', 'address', 'contact', 'education', 'marital', 'children', 'photo', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }, [currentStep])

  const goToPreviousStep = useCallback(() => {
    const steps: FormStep[] = ['personal', 'address', 'contact', 'education', 'marital', 'children', 'photo', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }, [currentStep])

  const goToStep = useCallback((step: FormStep) => {
    const steps: FormStep[] = ['personal', 'address', 'contact', 'education', 'marital', 'children', 'photo', 'review']
    const stepIndex = steps.indexOf(step)
    const currentIndex = steps.indexOf(currentStep)

    // Allow navigation to completed steps or the next immediate step
    if (completedSteps.includes(step) || stepIndex <= currentIndex + 1) {
      setCurrentStep(step)
    }
  }, [currentStep, completedSteps])

  // Handle step submissions - just store in local state
  const handlePersonalInfoSubmit = useCallback((data: PersonalInfo) => {
    handleStepComplete('personal', data)
  }, [handleStepComplete])

  const handleMailingAddressSubmit = useCallback((data: MailingAddress) => {
    handleStepComplete('address', data)
  }, [handleStepComplete])

  const handleContactInfoSubmit = useCallback((data: ContactInfo) => {
    handleStepComplete('contact', data)
  }, [handleStepComplete])

  const handleEducationSubmit = useCallback((data: Education) => {
    handleStepComplete('education', data)
  }, [handleStepComplete])

  const handleMaritalStatusSubmit = useCallback((data: MaritalStatusInfo) => {
    handleStepComplete('marital', data)
  }, [handleStepComplete])

  const handleChildrenSubmit = useCallback((data: Children) => {
    handleStepComplete('children', data)
  }, [handleStepComplete])

  const handlePhotoUploadSubmit = useCallback((data: { file: File; preview: string }) => {
    handleStepComplete('photo', data)
  }, [handleStepComplete])



  // Handle final submission with transaction number
  const handleFinalSubmit = useCallback(async (transactionNumber: string) => {
    setIsLoading(true)
    try {
      // Debug: Log form data structure
      console.log('Form data before transformation:', formData)
      console.log('Personal data:', formData.personal)
      console.log('Address data:', formData.address)
      console.log('Contact data:', formData.contact)
      console.log('Education data:', formData.education)
      console.log('Marital data:', formData.marital)
      console.log('Children data:', formData.children)

      // Transform nested form data to flat structure expected by API
      const applicationData = {
        // Personal Information
        familyName: formData.personal?.familyName || '',
        givenName: formData.personal?.givenName || '',
        middleName: formData.personal?.middleName || undefined,
        gender: formData.personal?.gender || 'MALE',
        dateOfBirth: formData.personal?.dateOfBirth || '',
        cityOfBirth: formData.personal?.cityOfBirth || '',
        countryOfBirth: formData.personal?.countryOfBirth || '',
        countryOfEligibility: formData.personal?.countryOfEligibility || '',
        eligibilityClaimType: formData.personal?.eligibilityClaimType || undefined,

        // Mailing Address
        inCareOf: formData.address?.inCareOf || undefined,
        addressLine1: formData.address?.addressLine1 || '',
        addressLine2: formData.address?.addressLine2 || undefined,
        city: formData.address?.city || '',
        stateProvince: formData.address?.stateProvince || '',
        postalCode: formData.address?.postalCode || '',
        country: formData.address?.country || '',
        countryOfResidence: formData.address?.countryOfResidence || '',

        // Contact Information
        phoneNumber: formData.contact?.phoneNumber || undefined,
        email: formData.contact?.email || '',

        // Education
        educationLevel: formData.education?.educationLevel || 'HIGH_SCHOOL_DIPLOMA',

        // Marital Status
        maritalStatus: formData.marital?.maritalStatus || 'UNMARRIED',
        spouseFamilyName: formData.marital?.spouseFamilyName || undefined,
        spouseGivenName: formData.marital?.spouseGivenName || undefined,
        spouseMiddleName: formData.marital?.spouseMiddleName || undefined,
        spouseGender: formData.marital?.spouseGender || undefined,
        spouseDateOfBirth: formData.marital?.spouseDateOfBirth || undefined,
        spouseCityOfBirth: formData.marital?.spouseCityOfBirth || undefined,
        spouseCountryOfBirth: formData.marital?.spouseCountryOfBirth || undefined,

        // Children
        children: formData.children?.children || [],
      }

      console.log('Transformed application data:', applicationData)

      const isEditing = !!existingApplication
      const url = isEditing
        ? `/api/applications/${existingApplication.id}/update`
        : '/api/applications/submit'

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error?.message || 'Failed to submit application')
      }

      const result = await response.json()
      if (result.success && onComplete) {
        await onComplete(formData as FormStepData)
      } else {
        throw new Error(result.error?.message || 'Submission failed')
      }
    } catch (error) {
      console.error('Submission error:', error)
      if (onError) {
        onError(error instanceof Error ? error.message : 'Submission failed')
      }
    } finally {
      setIsLoading(false)
    }
  }, [formData, onComplete, onError])

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
            onEdit={(step) => {
              setCurrentStep(step as FormStep)
            }}
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
        onStepClick={goToStep}
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