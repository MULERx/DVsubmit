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
      console.log('Initializing form with existing application:', existingApplication)

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
            familyName: child.familyName,
            givenName: child.givenName,
            middleName: child.middleName || '',
            gender: child.gender,
            dateOfBirth: typeof child.dateOfBirth === 'string'
              ? child.dateOfBirth
              : child.dateOfBirth.toISOString().split('T')[0],
            cityOfBirth: child.cityOfBirth,
            countryOfBirth: child.countryOfBirth,
          })),
        },
        // Initialize photo data if available
        ...(existingApplication.photoUrl && {
          photo: {
            file: new File([], 'existing-photo.jpg'), // Placeholder file
            preview: '',
            path: existingApplication.photoUrl,
            signedUrl: existingApplication.photoUrl,
          }
        }),
        ...(existingApplication.spousePhotoUrl && {
          spousePhoto: {
            file: new File([], 'existing-spouse-photo.jpg'), // Placeholder file
            preview: '',
            path: existingApplication.spousePhotoUrl,
            signedUrl: existingApplication.spousePhotoUrl,
          }
        }),
      }

      console.log('Transformed form data:', transformedData)
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
    console.log(`Completing step ${step} with data:`, data)
    setFormData(prev => {
      const updated = {
        ...prev,
        [step]: data
      }
      console.log('Updated form data:', updated)
      return updated
    })
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
      console.log('Photo data:', formData.photo)
      console.log('Spouse photo data:', formData.spousePhoto)
      console.log('Children photos data:', formData.childrenPhotos)

      // Validate that all required data is present
      if (!formData.personal || !formData.address || !formData.contact || !formData.education || !formData.marital) {
        const missingSteps = []
        if (!formData.personal) missingSteps.push('Personal Information')
        if (!formData.address) missingSteps.push('Mailing Address')
        if (!formData.contact) missingSteps.push('Contact Information')
        if (!formData.education) missingSteps.push('Education')
        if (!formData.marital) missingSteps.push('Marital Status')

        throw new Error(`Missing required form data: ${missingSteps.join(', ')}. Please complete all steps.`)
      }

      // Additional validation for required fields within each step
      const requiredFields = [
        { field: formData.personal.familyName, name: 'Family Name' },
        { field: formData.personal.givenName, name: 'Given Name' },
        { field: formData.personal.gender, name: 'Gender' },
        { field: formData.personal.dateOfBirth, name: 'Date of Birth' },
        { field: formData.personal.cityOfBirth, name: 'City of Birth' },
        { field: formData.personal.countryOfBirth, name: 'Country of Birth' },
        { field: formData.personal.countryOfEligibility, name: 'Country of Eligibility' },
        { field: formData.address.addressLine1, name: 'Address Line 1' },
        { field: formData.address.city, name: 'City' },
        { field: formData.address.stateProvince, name: 'State/Province' },
        { field: formData.address.postalCode, name: 'Postal Code' },
        { field: formData.address.country, name: 'Country' },
        { field: formData.address.countryOfResidence, name: 'Country of Residence' },
        { field: formData.contact.email, name: 'Email' },
        { field: formData.education.educationLevel, name: 'Education Level' },
        { field: formData.marital.maritalStatus, name: 'Marital Status' },
      ]

      const missingFields = requiredFields.filter(({ field }) => !field || field.trim() === '')
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.map(f => f.name).join(', ')}`)
      }

      // Transform nested form data to flat structure expected by API
      const applicationData = {
        // Personal Information
        familyName: formData.personal.familyName,
        givenName: formData.personal.givenName,
        middleName: formData.personal.middleName || undefined,
        gender: formData.personal.gender,
        dateOfBirth: formData.personal.dateOfBirth,
        cityOfBirth: formData.personal.cityOfBirth,
        countryOfBirth: formData.personal.countryOfBirth,
        countryOfEligibility: formData.personal.countryOfEligibility,
        eligibilityClaimType: formData.personal.eligibilityClaimType || undefined,

        // Mailing Address
        inCareOf: formData.address.inCareOf || undefined,
        addressLine1: formData.address.addressLine1,
        addressLine2: formData.address.addressLine2 || undefined,
        city: formData.address.city,
        stateProvince: formData.address.stateProvince,
        postalCode: formData.address.postalCode,
        country: formData.address.country,
        countryOfResidence: formData.address.countryOfResidence,

        // Contact Information
        phoneNumber: formData.contact.phoneNumber || undefined,
        email: formData.contact.email,

        // Education
        educationLevel: formData.education.educationLevel,

        // Marital Status
        maritalStatus: formData.marital.maritalStatus,
        spouseFamilyName: formData.marital.spouseFamilyName || undefined,
        spouseGivenName: formData.marital.spouseGivenName || undefined,
        spouseMiddleName: formData.marital.spouseMiddleName || undefined,
        spouseGender: formData.marital.spouseGender || undefined,
        spouseDateOfBirth: formData.marital.spouseDateOfBirth || undefined,
        spouseCityOfBirth: formData.marital.spouseCityOfBirth || undefined,
        spouseCountryOfBirth: formData.marital.spouseCountryOfBirth || undefined,

        // Photos
        photoUrl: formData.photo?.path || undefined,
        spousePhotoUrl: formData.spousePhoto?.path || undefined,

        // Children (with photo URLs)
        children: (formData.children?.children || []).map((child, index) => ({
          ...child,
          photoUrl: formData.childrenPhotos?.[index]?.path || undefined,
        })),
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

      const result = await response.json()
      console.log('API Response:', result)

      if (!response.ok) {
        console.error('API Error Response:', result)
        if (result.error?.code === 'VALIDATION_ERROR') {
          console.error('Validation errors:', result.error.details)
          throw new Error(`Validation failed: ${result.error.details?.map((d: any) => d.message).join(', ') || result.error.message}`)
        }
        throw new Error(result.error?.message || `HTTP ${response.status}: Failed to submit application`)
      }

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
            key={existingApplication?.id || 'new'}
            initialData={formData.personal}
            onSubmit={handlePersonalInfoSubmit}
            onNext={goToNextStep}
            isLoading={isLoading}
          />
        )

      case 'address':
        return (
          <MailingAddressForm
            key={existingApplication?.id || 'new'}
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
            key={existingApplication?.id || 'new'}
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
            key={existingApplication?.id || 'new'}
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
            key={existingApplication?.id || 'new'}
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
            key={existingApplication?.id || 'new'}
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
            key={existingApplication?.id || 'new'}
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