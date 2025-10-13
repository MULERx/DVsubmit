'use client'

import { useResendConfirmationMutation } from '@/hooks/use-auth-mutations'

interface ResendConfirmationButtonProps {
  email: string
  className?: string
  variant?: 'button' | 'link'
  children?: React.ReactNode
}

export function ResendConfirmationButton({ 
  email, 
  className = '', 
  variant = 'button',
  children 
}: ResendConfirmationButtonProps) {
  const resendConfirmationMutation = useResendConfirmationMutation()

  const handleResend = () => {
    resendConfirmationMutation.mutate(email)
  }

  const defaultText = resendConfirmationMutation.isPending ? 'Sending...' : 'Resend confirmation email'

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleResend}
        disabled={resendConfirmationMutation.isPending}
        className={`text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {children || defaultText}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={resendConfirmationMutation.isPending}
      className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {resendConfirmationMutation.isPending ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          Sending...
        </div>
      ) : (
        children || 'Resend confirmation email'
      )}
    </button>
  )
}