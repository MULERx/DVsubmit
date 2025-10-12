import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { FormStepData } from '@/lib/types/application'

// Types
interface ApplicationSubmissionResponse {
  success: boolean
  data?: {
    id: string
    transactionNumber?: string
  }
  error?: {
    message: string
    code?: string
    details?: any[]
  }
}

interface ApplicationUpdateResponse {
  success: boolean
  data?: {
    id: string
  }
  error?: {
    message: string
    code?: string
    details?: any[]
  }
}

// API functions
const submitApplication = async (applicationData: any): Promise<ApplicationSubmissionResponse> => {
  const response = await fetch('/api/applications/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error?.message || `HTTP ${response.status}: Failed to submit application`)
  }

  return result
}

const updateApplication = async ({ 
  id, 
  applicationData 
}: { 
  id: string
  applicationData: any 
}): Promise<ApplicationUpdateResponse> => {
  const response = await fetch(`/api/applications/${id}/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error?.message || `HTTP ${response.status}: Failed to update application`)
  }

  return result
}

// Custom hooks
export function useApplicationSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitApplication,
    onSuccess: (data) => {
      toast({
        title: 'Application Submitted',
        description: `Your application has been submitted successfully. ${
          data.data?.transactionNumber ? `Transaction number: ${data.data.transactionNumber}` : ''
        }`,
      })
      
      // Invalidate applications queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useApplicationUpdate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateApplication,
    onSuccess: (data, variables) => {
      toast({
        title: 'Application Updated',
        description: 'Your application has been updated successfully.',
      })
      
      // Invalidate specific application and list queries
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useApplicationDelete() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteApplication = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const response = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete application: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  }

  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      toast({
        title: 'Application Deleted',
        description: 'Application has been deleted successfully.',
      })
      
      // Invalidate applications queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Helper function to transform form data for API submission
export function transformFormDataForSubmission(formData: FormStepData) {
  if (!formData.personal || !formData.address || !formData.contact || !formData.education || !formData.marital) {
    throw new Error('Missing required form data sections')
  }

  return {
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
}