import { useState, useEffect, useCallback } from 'react'
import { FormStepData, FormStep } from '@/lib/types/application'
import { ApplicationService } from '@/lib/services/application-service'
import { PaymentService } from '@/lib/services/payment-service'
import { NotificationService } from '@/lib/services/notification-service'
import { useToast } from './use-toast'

interface UseApplicationFormOptions {
  autoSaveDelay?: number
  onError?: (error: string) => void
}

export function useApplicationForm(options: UseApplicationFormOptions = {}) {
  const { autoSaveDelay = 2000, onError } = options
  const [formData, setFormData] = useState<Partial<FormStepData>>({})
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'>('PENDING')
  const { toast } = useToast()

  // Load existing draft application on mount (unless starting fresh)
  useEffect(() => {
    const loadApplication = async () => {
      setIsLoading(true)
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const startFresh = urlParams.get('new') === 'true'
        const editApplicationId = urlParams.get('edit')
        
        if (startFresh) {
          // Don't load any existing data, start completely fresh
          setIsLoading(false)
          return
        }

        if (editApplicationId) {
          // Load specific application for editing
          const apiResponse = await fetch(`/api/applications/${editApplicationId}`)
          if (apiResponse.ok) {
            const result = await apiResponse.json()
            if (result.success && result.data) {
              setCurrentApplicationId(result.data.id)
              const convertedData = ApplicationService.convertApplicationToFormData(result.data)
              setFormData(convertedData)
              setLastSaved(new Date(result.data.updatedAt))
              
              // Load payment status if payment reference exists
              if (result.data?.paymentReference) {
                setPaymentStatus(result.data.paymentStatus)
                // Set payment data in form
                setFormData(prev => ({
                  ...prev,
                  payment: { paymentReference: result.data!.paymentReference! }
                }))
              }
            }
          }
        } else {
          // Load most recent draft application
          const serviceResponse = await ApplicationService.getCurrentDraftApplication()
          if (serviceResponse.success && serviceResponse.data) {
            setCurrentApplicationId(serviceResponse.data.id)
            const convertedData = ApplicationService.convertApplicationToFormData(serviceResponse.data)
            setFormData(convertedData)
            setLastSaved(new Date(serviceResponse.data.updatedAt))
            
            // Load payment status if payment reference exists
            if (serviceResponse.data?.paymentReference) {
              setPaymentStatus(serviceResponse.data.paymentStatus)
              // Set payment data in form
              setFormData(prev => ({
                ...prev,
                payment: { paymentReference: serviceResponse.data!.paymentReference! }
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error loading application:', error)
        onError?.('Failed to load application data')
      } finally {
        setIsLoading(false)
      }
    }

    loadApplication()
  }, [onError])

  // Auto-save functionality with debouncing
  const autoSave = useCallback(async (data: Partial<FormStepData>) => {
    if (!hasUnsavedChanges) return
    
    // Prevent auto-save if payment is pending or verified (form locked)
    if (paymentStatus === 'PENDING' || paymentStatus === 'VERIFIED') {
      return
    }

    setIsSaving(true)
    try {
      const response = await ApplicationService.autoSaveApplication(data, currentApplicationId)
      if (response.success) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        toast({
          title: "Auto-saved",
          description: "Your progress has been saved automatically.",
          duration: 2000,
        })
      } else {
        // Handle draft limit error specifically
        if (response.error?.code === 'DRAFT_LIMIT_EXCEEDED') {
          toast({
            title: "Draft Limit Reached",
            description: response.error.message,
            variant: "destructive",
            duration: 5000,
          })
          onError?.(response.error.message)
          return // Don't throw error, just show message
        }
        throw new Error(response.error?.message || 'Auto-save failed')
      }
    } catch (error) {
      console.error('Auto-save error:', error)
      onError?.('Failed to auto-save your progress')
    } finally {
      setIsSaving(false)
    }
  }, [hasUnsavedChanges, onError, toast, paymentStatus])

  // Debounced auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timeoutId = setTimeout(() => {
      autoSave(formData)
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [formData, hasUnsavedChanges, autoSave, autoSaveDelay])

  // Update form data
  const updateFormData = useCallback((stepData: Partial<FormStepData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...stepData }
      setHasUnsavedChanges(true)
      return updated
    })
  }, [])

  // Update specific step data
  const updateStepData = useCallback(async (step: FormStep, data: any) => {
    // Prevent updates to non-payment steps if payment is pending or verified (form locked)
    if (step !== 'payment' && (paymentStatus === 'PENDING' || paymentStatus === 'VERIFIED')) {
      return
    }
    
    // Handle payment step specially
    if (step === 'payment') {
      setIsSaving(true)
      try {
        const response = await PaymentService.submitPaymentReference(data.paymentReference)
        if (response.success) {
          setPaymentStatus(response.data?.paymentStatus || 'PENDING')
          updateFormData({ [step]: data })
          toast({
            title: "Payment Reference Submitted",
            description: "Your payment reference has been submitted for verification.",
          })
        } else {
          throw new Error(response.error?.message || 'Payment submission failed')
        }
      } catch (error) {
        console.error('Payment submission error:', error)
        onError?.('Failed to submit payment reference')
        toast({
          title: "Payment Submission Failed",
          description: "Failed to submit payment reference. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      updateFormData({ [step]: data })
    }
  }, [updateFormData, onError, toast, paymentStatus])

  // Manual save
  const saveManually = useCallback(async () => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)
    try {
      const response = await ApplicationService.autoSaveApplication(formData, currentApplicationId)
      if (response.success) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        toast({
          title: "Saved",
          description: "Your application has been saved successfully.",
        })
        return true
      } else {
        throw new Error(response.error?.message || 'Save failed')
      }
    } catch (error) {
      console.error('Manual save error:', error)
      onError?.('Failed to save your application')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [formData, hasUnsavedChanges, onError, toast])

  // Check for duplicate submissions
  const checkDuplicateSubmission = useCallback(async () => {
    try {
      const response = await ApplicationService.checkDuplicateSubmission()
      return response
    } catch (error) {
      console.error('Duplicate check error:', error)
      return {
        success: false,
        error: {
          code: 'CHECK_ERROR',
          message: 'Failed to check for duplicate submissions',
        },
      }
    }
  }, [])

  // Submit final application
  const submitApplication = useCallback(async (finalData: FormStepData) => {
    setIsLoading(true)
    try {
      const response = await ApplicationService.submitApplication(finalData)
      if (response.success) {
        setHasUnsavedChanges(false)
        setLastSaved(new Date())
        toast({
          title: "Application Submitted",
          description: "Your DV lottery application has been submitted for payment processing.",
        })
        return response.data
      } else {
        const errorMessage = response.error?.code === 'DUPLICATE_SUBMISSION' 
          ? 'You already have an active application for the current DV cycle.'
          : response.error?.message || 'Submission failed'
        
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        })
        onError?.(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Submission error:', error)
      const errorMessage = 'Failed to submit your application'
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      })
      onError?.(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [onError, toast])

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!formData.payment?.paymentReference) return

    try {
      const response = await PaymentService.getPaymentStatus()
      if (response.success && response.data) {
        const newStatus = response.data.paymentStatus
        if (newStatus !== paymentStatus) {
          setPaymentStatus(newStatus)
          
          // Create persistent notification for status changes
          if (newStatus !== 'PENDING' && formData.payment?.paymentReference) {
            NotificationService.createPaymentStatusNotification(
              newStatus as 'VERIFIED' | 'REJECTED' | 'REFUNDED',
              formData.payment.paymentReference
            )
          }
          
          // Show toast notification for status changes
          const statusMessage = PaymentService.getPaymentStatusMessage(newStatus)
          toast({
            title: statusMessage.title,
            description: statusMessage.description,
            variant: statusMessage.variant === 'error' ? 'destructive' : 'default',
          })
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }, [formData.payment?.paymentReference, paymentStatus, toast])

  // Periodic payment status check
  useEffect(() => {
    if (!formData.payment?.paymentReference || paymentStatus === 'VERIFIED') return

    const interval = setInterval(checkPaymentStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [formData.payment?.paymentReference, paymentStatus, checkPaymentStatus])

  // Get completion status for each step
  const getStepCompletionStatus = useCallback(() => {
    const completedSteps: FormStep[] = []
    
    if (formData.personal?.firstName && formData.personal?.lastName && 
        formData.personal?.dateOfBirth && formData.personal?.countryOfBirth && 
        formData.personal?.countryOfEligibility) {
      completedSteps.push('personal')
    }
    
    if (formData.contact?.email && formData.contact?.phone && 
        formData.contact?.address?.street && formData.contact?.address?.city && 
        formData.contact?.address?.country) {
      completedSteps.push('contact')
    }
    
    if (formData.education?.education && formData.education?.occupation) {
      completedSteps.push('education')
    }
    
    if (formData.photo?.file) {
      completedSteps.push('photo')
    }
    
    // Review step is completed if all previous steps are completed OR if payment data exists
    const allPreviousStepsCompleted = completedSteps.includes('personal') && 
                                     completedSteps.includes('contact') && 
                                     completedSteps.includes('education') && 
                                     completedSteps.includes('photo')
    
    if (allPreviousStepsCompleted || formData.payment?.paymentReference) {
      completedSteps.push('review')
    }
    
    if (formData.payment?.paymentReference && paymentStatus === 'VERIFIED') {
      completedSteps.push('payment')
    }
    
    return completedSteps
  }, [formData, paymentStatus])

  return {
    formData,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    paymentStatus,
    updateFormData,
    updateStepData,
    saveManually,
    submitApplication,
    checkDuplicateSubmission,
    checkPaymentStatus,
    getStepCompletionStatus,
  }
}