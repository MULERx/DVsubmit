import { ReactNode } from 'react'

interface FormStepWrapperProps {
  title: string
  description: string
  children: ReactNode
}

/**
 * Reusable wrapper component for form steps
 */
export function FormStepWrapper({ title, description, children }: FormStepWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      {children}
    </div>
  )
}