import { useState, useCallback } from 'react'
import { FormStep, FormStepData } from '@/lib/types/application'

const FORM_STEPS: FormStep[] = ['personal', 'address', 'contact', 'education', 'marital', 'children', 'photo', 'review']

/**
 * Custom hook for managing form step navigation and completion tracking
 */
export const useFormSteps = (initialStep: FormStep = 'personal') => {
  const [currentStep, setCurrentStep] = useState<FormStep>(initialStep)

  /**
   * Get completed steps based on form data
   */
  const getCompletedSteps = useCallback((formData: Partial<FormStepData>): FormStep[] => {
    const completed: FormStep[] = []
    if (formData.personal) completed.push('personal')
    if (formData.address) completed.push('address')
    if (formData.contact) completed.push('contact')
    if (formData.education) completed.push('education')
    if (formData.marital) completed.push('marital')
    if (formData.children !== undefined) completed.push('children')
    if (formData.photo) completed.push('photo')
    return completed
  }, [])

  /**
   * Navigate to the next step
   */
  const goToNextStep = useCallback(() => {
    const currentIndex = FORM_STEPS.indexOf(currentStep)
    if (currentIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentIndex + 1])
    }
  }, [currentStep])

  /**
   * Navigate to the previous step
   */
  const goToPreviousStep = useCallback(() => {
    const currentIndex = FORM_STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(FORM_STEPS[currentIndex - 1])
    }
  }, [currentStep])

  /**
   * Navigate to a specific step (with validation)
   */
  const goToStep = useCallback((step: FormStep, completedSteps: FormStep[]) => {
    const stepIndex = FORM_STEPS.indexOf(step)
    const currentIndex = FORM_STEPS.indexOf(currentStep)

    // Allow navigation to completed steps or the next immediate step
    if (completedSteps.includes(step) || stepIndex <= currentIndex + 1) {
      setCurrentStep(step)
      return true
    }
    return false
  }, [currentStep])

  /**
   * Check if a step can be navigated to
   */
  const canNavigateToStep = useCallback((step: FormStep, completedSteps: FormStep[]): boolean => {
    const stepIndex = FORM_STEPS.indexOf(step)
    const currentIndex = FORM_STEPS.indexOf(currentStep)
    return completedSteps.includes(step) || stepIndex <= currentIndex + 1
  }, [currentStep])

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canNavigateToStep,
    getCompletedSteps,
    allSteps: FORM_STEPS
  }
}