import { FormStepData } from '@/lib/types/application'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  missingFields: string[]
}

export function validateFormCompletion(formData: Partial<FormStepData>): ValidationResult {
  const errors: string[] = []
  const missingFields: string[] = []

  // Personal Information validation
  if (!formData.personal?.firstName) {
    missingFields.push('First Name')
    errors.push('First name is required')
  }
  
  if (!formData.personal?.lastName) {
    missingFields.push('Last Name')
    errors.push('Last name is required')
  }
  
  if (!formData.personal?.dateOfBirth) {
    missingFields.push('Date of Birth')
    errors.push('Date of birth is required')
  }
  
  if (!formData.personal?.countryOfBirth) {
    missingFields.push('Country of Birth')
    errors.push('Country of birth is required')
  }
  
  if (!formData.personal?.countryOfEligibility) {
    missingFields.push('Country of Eligibility')
    errors.push('Country of eligibility is required')
  }

  // Contact Information validation
  if (!formData.contact?.email) {
    missingFields.push('Email Address')
    errors.push('Email address is required')
  }
  
  if (!formData.contact?.phone) {
    missingFields.push('Phone Number')
    errors.push('Phone number is required')
  }
  
  if (!formData.contact?.address?.street) {
    missingFields.push('Street Address')
    errors.push('Street address is required')
  }
  
  if (!formData.contact?.address?.city) {
    missingFields.push('City')
    errors.push('City is required')
  }
  
  if (!formData.contact?.address?.state) {
    missingFields.push('State/Province')
    errors.push('State or province is required')
  }
  
  if (!formData.contact?.address?.postalCode) {
    missingFields.push('Postal Code')
    errors.push('Postal code is required')
  }
  
  if (!formData.contact?.address?.country) {
    missingFields.push('Country')
    errors.push('Country is required')
  }

  // Education and Work validation
  if (!formData.education?.education) {
    missingFields.push('Education Level')
    errors.push('Education level is required')
  }
  
  if (!formData.education?.occupation) {
    missingFields.push('Occupation')
    errors.push('Occupation is required')
  }

  // Photo validation
  if (!formData.photo?.file) {
    missingFields.push('Photo')
    errors.push('Photo is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields,
  }
}

export function getFormCompletionPercentage(formData: Partial<FormStepData>): number {
  const totalFields = 13 // Total required fields (including photo)
  const validation = validateFormCompletion(formData)
  const completedFields = totalFields - validation.missingFields.length
  return Math.round((completedFields / totalFields) * 100)
}

export function getStepValidationStatus(formData: Partial<FormStepData>) {
  return {
    personal: !!(
      formData.personal?.firstName &&
      formData.personal?.lastName &&
      formData.personal?.dateOfBirth &&
      formData.personal?.countryOfBirth &&
      formData.personal?.countryOfEligibility
    ),
    contact: !!(
      formData.contact?.email &&
      formData.contact?.phone &&
      formData.contact?.address?.street &&
      formData.contact?.address?.city &&
      formData.contact?.address?.state &&
      formData.contact?.address?.postalCode &&
      formData.contact?.address?.country
    ),
    education: !!(
      formData.education?.education &&
      formData.education?.occupation
    ),
    photo: !!(
      formData.photo?.file
    ),
  }
}