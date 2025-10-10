'use client'

import { Progress } from '@/components/ui/progress'
import { FormStep } from '@/lib/types/application'

interface FormProgressProps {
  currentStep: FormStep
  completedSteps: FormStep[]
}

const steps: FormStep[] = ['personal', 'contact', 'education', 'photo', 'payment', 'review']

export function FormProgress({ currentStep, completedSteps }: FormProgressProps) {
  const currentStepIndex = steps.findIndex(step => step === currentStep)
  const totalSteps = steps.length
  
  // Calculate progress: completed steps + partial progress for current step
  const completedCount = completedSteps.length
  const progressPercentage = Math.min(
    ((completedCount + (currentStepIndex >= 0 ? 0.5 : 0)) / totalSteps) * 100,
    100
  )

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {Math.max(currentStepIndex + 1, 1)} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  )
}