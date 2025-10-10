import { FormStepData, ApplicationRecord, ApiResponse } from '@/lib/types/application'

export class ApplicationService {
  private static baseUrl = '/api/applications'

  static async getApplications(): Promise<ApiResponse<ApplicationRecord[]>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching applications:', error)
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch applications',
        },
      }
    }
  }

  static async getCurrentDraftApplication(): Promise<ApiResponse<ApplicationRecord | null>> {
    try {
      const response = await this.getApplications()
      if (!response.success || !response.data) {
        return {
          success: response.success,
          error: response.error,
          data: null,
        }
      }

      // Find the current draft application
      const draftApplication = response.data.find(app => app.status === 'DRAFT')

      return {
        success: true,
        data: draftApplication || null,
      }
    } catch (error) {
      console.error('Error fetching draft application:', error)
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch draft application',
        },
      }
    }
  }

  static async autoSaveApplication(data: Partial<FormStepData>): Promise<ApiResponse<ApplicationRecord>> {
    try {
      const response = await fetch(`${this.baseUrl}/auto-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error auto-saving application:', error)
      return {
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: 'Failed to auto-save application',
        },
      }
    }
  }

  static async checkDuplicateSubmission(): Promise<ApiResponse<{
    canSubmit: boolean
    hasDuplicate: boolean
    existingApplications: any[]
    message: string
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/check-duplicate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking for duplicates:', error)
      return {
        success: false,
        error: {
          code: 'CHECK_ERROR',
          message: 'Failed to check for duplicate submissions',
        },
      }
    }
  }

  static async submitApplication(data: FormStepData): Promise<ApiResponse<ApplicationRecord>> {
    try {
      // First check for duplicates
      const duplicateCheck = await this.checkDuplicateSubmission()
      if (duplicateCheck.success && duplicateCheck.data && !duplicateCheck.data.canSubmit) {
        return {
          success: false,
          error: {
            code: 'DUPLICATE_SUBMISSION',
            message: duplicateCheck.data.message,
          },
        }
      }

      // Convert FormStepData to the format expected by the API
      const applicationData = {
        firstName: data.personal?.firstName || '',
        lastName: data.personal?.lastName || '',
        dateOfBirth: data.personal?.dateOfBirth || '',
        countryOfBirth: data.personal?.countryOfBirth || '',
        countryOfEligibility: data.personal?.countryOfEligibility || '',
        email: data.contact?.email || '',
        phone: data.contact?.phone || '',
        address: data.contact?.address || {},
        education: data.education?.education || '',
        occupation: data.education?.occupation || '',
      }

      const response = await fetch(`${this.baseUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || {
            code: 'SUBMIT_ERROR',
            message: 'Failed to submit application',
          },
        }
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting application:', error)
      return {
        success: false,
        error: {
          code: 'SUBMIT_ERROR',
          message: 'Failed to submit application',
        },
      }
    }
  }

  static convertApplicationToFormData(application: ApplicationRecord): FormStepData {
    // Safely convert dateOfBirth to string format
    let dateOfBirthString = ''
    if (application.dateOfBirth) {
      if (application.dateOfBirth instanceof Date) {
        dateOfBirthString = application.dateOfBirth.toISOString().split('T')[0]
      } else if (typeof application.dateOfBirth === 'string') {
        // If it's already a string, try to parse it and format it
        const date = new Date(application.dateOfBirth)
        if (!isNaN(date.getTime())) {
          dateOfBirthString = date.toISOString().split('T')[0]
        } else {
          dateOfBirthString = application.dateOfBirth
        }
      }
    }

    return {
      personal: {
        firstName: application.firstName,
        lastName: application.lastName,
        dateOfBirth: dateOfBirthString,
        countryOfBirth: application.countryOfBirth,
        countryOfEligibility: application.countryOfEligibility,
      },
      contact: {
        email: application.email,
        phone: application.phone,
        address: application.address as any,
      },
      education: {
        education: application.education as any,
        occupation: application.occupation,
      },
    }
  }
}