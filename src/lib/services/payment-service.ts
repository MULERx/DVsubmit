import { ApiResponse, Payment } from '@/lib/types/application'
import { NotificationService } from './notification-service'

export interface PaymentStatusResponse {
  id: string
  paymentReference: string | null
  paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'
  status: string
  paymentVerifiedAt: Date | null
  paymentVerifiedBy: string | null
  updatedAt: Date
  verificationDetails?: {
    verifiedBy: string
    verifiedAt: Date | null
  }
}

export class PaymentService {
  /**
   * Submit payment reference for verification
   */
  static async submitPaymentReference(paymentReference: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentReference }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error submitting payment reference:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to submit payment reference. Please check your connection.',
        },
      }
    }
  }

  /**
   * Get current payment status
   */
  static async getPaymentStatus(): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      const response = await fetch('/api/payments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching payment status:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch payment status. Please check your connection.',
        },
      }
    }
  }

  /**
   * Get payment status by application ID
   */
  static async getPaymentStatusById(applicationId: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      const response = await fetch(`/api/payments/${applicationId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching payment status by ID:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch payment status. Please check your connection.',
        },
      }
    }
  }

  /**
   * Check if payment allows form modification
   */
  static canModifyApplication(paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'): boolean {
    // Users can modify their application only if payment is not verified
    return paymentStatus !== 'VERIFIED'
  }

  /**
   * Check if user can proceed to next step
   */
  static canProceedToReview(paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'): boolean {
    // Users can only proceed to review if payment is verified
    return paymentStatus === 'VERIFIED'
  }

  /**
   * Get user-friendly payment status message
   */
  static getPaymentStatusMessage(paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'): {
    title: string
    description: string
    variant: 'success' | 'error' | 'warning' | 'info'
  } {
    switch (paymentStatus) {
      case 'VERIFIED':
        return {
          title: 'Payment Verified',
          description: 'Your payment has been verified successfully. You can now proceed to review your application.',
          variant: 'success'
        }
      case 'REJECTED':
        return {
          title: 'Payment Rejected',
          description: 'Your payment could not be verified. Please check your payment reference and submit a new one.',
          variant: 'error'
        }
      case 'REFUNDED':
        return {
          title: 'Payment Refunded',
          description: 'Your payment has been refunded. You can submit a new payment reference to continue.',
          variant: 'info'
        }
      default:
        return {
          title: 'Payment Pending Verification',
          description: 'Your payment reference has been submitted and is pending admin verification. This usually takes 1-2 business days.',
          variant: 'warning'
        }
    }
  }

  /**
   * Format payment reference for display
   */
  static formatPaymentReference(reference: string): string {
    // Add spaces every 4 characters for better readability
    return reference.replace(/(.{4})/g, '$1 ').trim()
  }

  /**
   * Validate payment reference format
   */
  static validatePaymentReference(reference: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!reference) {
      errors.push('Payment reference is required')
      return { isValid: false, errors }
    }

    if (reference.length < 10) {
      errors.push('Payment reference must be at least 10 characters long')
    }

    if (reference.length > 50) {
      errors.push('Payment reference must be less than 50 characters long')
    }

    if (!/^[A-Z0-9]+$/.test(reference)) {
      errors.push('Payment reference must contain only uppercase letters and numbers')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}