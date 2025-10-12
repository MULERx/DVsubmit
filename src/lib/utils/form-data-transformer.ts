import { ApplicationRecord, FormStepData } from '@/lib/types/application'

/**
 * Utility functions for transforming data between ApplicationRecord and FormStepData formats
 */

/**
 * Converts a date (Date object or ISO string) to YYYY-MM-DD format for HTML date inputs
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  if (typeof date === 'string') {
    // Handle ISO string format
    return date.includes('T') ? date.split('T')[0] : date
  }
  
  // Handle Date object
  return date.toISOString().split('T')[0]
}

/**
 * Transforms an ApplicationRecord into FormStepData for form initialization
 */
export const transformApplicationToFormData = (application: ApplicationRecord): Partial<FormStepData> => {
  return {
    personal: {
      familyName: application.familyName,
      givenName: application.givenName,
      middleName: application.middleName || '',
      gender: application.gender,
      dateOfBirth: formatDateForInput(application.dateOfBirth),
      cityOfBirth: application.cityOfBirth,
      countryOfBirth: application.countryOfBirth,
      countryOfEligibility: application.countryOfEligibility,
      eligibilityClaimType: application.eligibilityClaimType || undefined,
    },
    address: {
      inCareOf: application.inCareOf || '',
      addressLine1: application.addressLine1,
      addressLine2: application.addressLine2 || '',
      city: application.city,
      stateProvince: application.stateProvince,
      postalCode: application.postalCode,
      country: application.country,
      countryOfResidence: application.countryOfResidence,
    },
    contact: {
      phoneNumber: application.phoneNumber || '',
      email: application.email,
    },
    education: {
      educationLevel: application.educationLevel,
    },
    marital: {
      maritalStatus: application.maritalStatus,
      spouseFamilyName: application.spouseFamilyName || '',
      spouseGivenName: application.spouseGivenName || '',
      spouseMiddleName: application.spouseMiddleName || '',
      spouseGender: application.spouseGender || undefined,
      spouseDateOfBirth: formatDateForInput(application.spouseDateOfBirth),
      spouseCityOfBirth: application.spouseCityOfBirth || '',
      spouseCountryOfBirth: application.spouseCountryOfBirth || '',
    },
    children: {
      children: (application.children || []).map(child => ({
        familyName: child.familyName,
        givenName: child.givenName,
        middleName: child.middleName || '',
        gender: child.gender,
        dateOfBirth: formatDateForInput(child.dateOfBirth),
        cityOfBirth: child.cityOfBirth,
        countryOfBirth: child.countryOfBirth,
      })),
    },
    payment: {
      paymentReference: application.paymentReference || ''
    }
  }
}

/**
 * Creates photo data structure for existing application photos
 */
export const createPhotoData = (photoUrl: string) => ({
  file: new File([], 'existing-photo.jpg'), // Placeholder file
  preview: '',
  path: photoUrl,
  signedUrl: undefined, // Will be fetched separately
})