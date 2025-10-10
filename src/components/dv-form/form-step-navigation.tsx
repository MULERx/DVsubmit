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
  { key: 'review', label: 'Review', description: 'Review and submit' },
  { key: 'payment', label: 'Payment', description: 'Service fee payment' },
]

export function FormStepNavigation({
  currentStep,
  completedSteps,
  onStepClick
}: FormStepNavigationProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStep)

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-x-4 md:space-y-0">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key)
          const isCurrent = step.key === currentStep
          const isClickable = onStepClick && (isCompleted || index <= currentStepIndex)

          return (
            <li key={step.key} className="md:flex-1">
              <div
                className={cn(
                  "group relative flex items-start md:items-center md:flex-col border-l-4 py-3 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 transition-colors duration-200",
                  {
                    "border-primary": isCurrent,
                    "border-green-500": isCompleted,
                    "border-gray-200": !isCurrent && !isCompleted,
                    "cursor-pointer hover:border-gray-300": isClickable && !isCurrent && !isCompleted,
                  }
                )}
                onClick={() => isClickable && onStepClick?.(step.key)}
              >
                <div className="flex items-center md:flex-col md:items-center">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 mr-4 md:mr-0 md:mb-2 transition-colors duration-200 flex-shrink-0",
                      {
                        "border-primary bg-primary text-primary-foreground": isCurrent,
                        "border-green-500 bg-green-500 text-white": isCompleted,
                        "border-gray-300 bg-white text-gray-500": !isCurrent && !isCompleted,
                        "group-hover:border-gray-400": isClickable && !isCurrent && !isCompleted,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </span>

                  <div className="md:text-center">
                    <div
                      className={cn("text-sm font-medium transition-colors duration-200", {
                        "text-primary": isCurrent,
                        "text-green-600": isCompleted,
                        "text-gray-900": !isCurrent && !isCompleted,
                        "group-hover:text-gray-700": isClickable && !isCurrent && !isCompleted,
                      })}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn("text-xs mt-1 transition-colors duration-200", {
                        "text-primary/70": isCurrent,
                        "text-green-600/70": isCompleted,
                        "text-gray-500": !isCurrent && !isCompleted,
                        "group-hover:text-gray-600": isClickable && !isCurrent && !isCompleted,
                      })}
                    >
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}