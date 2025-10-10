'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormStep } from '@/lib/types/application'

interface FormStepNavigationProps {
  currentStep: FormStep
  completedSteps: FormStep[]
  onStepClick?: (step: FormStep) => void
}

const steps: { key: FormStep; label: string; description: string }[] = [
  { key: 'personal', label: 'Personal Info', description: 'Basic personal information' },
  { key: 'contact', label: 'Contact Info', description: 'Address and contact details' },
  { key: 'education', label: 'Education & Work', description: 'Education and occupation' },
  { key: 'photo', label: 'Photo Upload', description: 'DV compliant photo' },
  { key: 'payment', label: 'Payment', description: 'Service fee payment' },
  { key: 'review', label: 'Review', description: 'Review and submit' },
]

export function FormStepNavigation({ 
  currentStep, 
  completedSteps, 
  onStepClick 
}: FormStepNavigationProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStep)

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key)
          const isCurrent = step.key === currentStep
          const isClickable = onStepClick && (isCompleted || index <= currentStepIndex)

          return (
            <li key={step.key} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  {
                    "border-primary": isCurrent,
                    "border-green-500": isCompleted,
                    "border-gray-200": !isCurrent && !isCompleted,
                    "cursor-pointer hover:border-gray-300": isClickable && !isCurrent && !isCompleted,
                  }
                )}
                onClick={() => isClickable && onStepClick(step.key)}
              >
                <span className="flex items-center text-sm font-medium">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 mr-3 md:mr-0 md:mb-2",
                      {
                        "border-primary bg-primary text-primary-foreground": isCurrent,
                        "border-green-500 bg-green-500 text-white": isCompleted,
                        "border-gray-300 bg-white text-gray-500": !isCurrent && !isCompleted,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </span>
                  <span
                    className={cn("text-sm font-medium", {
                      "text-primary": isCurrent,
                      "text-green-600": isCompleted,
                      "text-gray-500": !isCurrent && !isCompleted,
                    })}
                  >
                    {step.label}
                  </span>
                </span>
                <span
                  className={cn("text-sm", {
                    "text-primary": isCurrent,
                    "text-green-600": isCompleted,
                    "text-gray-500": !isCurrent && !isCompleted,
                  })}
                >
                  {step.description}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}