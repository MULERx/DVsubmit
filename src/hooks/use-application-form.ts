import { useState, useEffect, useCallback } from 'react'
import { FormStepData, FormStep } from '@/lib/types/application'
import { ApplicationService } from '@/lib/services/application-service'
import { useToast } from './use-toast'

interface UseApplicationFormOptions {
  autoSaveDelay?: number
  onError?: (error: string) => void
}

export function useApplicationForm(options: UseApplicationFormOptions = {}) {
  const { autoSaveDelay = 2000, onError } = options
  const [formData, setFormData] = useState<Partial<FormStepData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Load existing draft application on mount
  useEffect(() => {
    const loadDraftApplication = async () => {
      setIsLoading(true)
      try {
        const response = await ApplicationService.getCurrentDraftApplication()
        if (response.success && response.data) {
          const convertedData = ApplicationService.convertApplicationToFormData(response.data)
          setFormData(convertedData)
          setLastSaved(new Date(response.data.updatedAt))
        }
      } catch (error) {
        console.error('Error loading draft application:', error)
        onError?.('Failed to load existing application data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDraftApplication()
  }, [onError])

  // Auto-save functionality with debouncing
  const autoSave = useCallback(async (data: Partial<FormStepData>) => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)
    try {
      const response = await ApplicationService.autoSaveApplication(data)
      if (response.success) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        toast({
          title: "Auto-saved",
          description: "Your progress has been saved automatically.",
          duration: 2000,
        })
      } else {
        throw new Error(response.error?.message || 'Auto-save failed')
      }
    } catch (error) {
      console.error('Auto-save error:', error)
      onError?.('Failed to auto-save your progress')
    } finally {
      setIsSaving(false)
    }
  }, [hasUnsavedChanges, onError, toast])

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
  const updateStepData = useCallback((step: FormStep, data: any) => {
    updateFormData({ [step]: data })
  }, [updateFormData])

  // Manual save
  const saveManually = useCallback(async () => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)
    try {
      const response = await ApplicationService.autoSaveApplication(formData)
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
    
    // Photo and payment steps will be added in future tasks
    
    return completedSteps
  }, [formData])

  return {
    formData,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    updateFormData,
    updateStepData,
    saveManually,
    submitApplication,
    checkDuplicateSubmission,
    getStepCompletionStatus,
  }
}