import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { authErrors, authClient } from '@/lib/auth/auth-helpers'
import { useToast } from '@/hooks/use-toast'
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData
} from '@/lib/validations/auth'

export function useLoginMutation() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await signIn(data.email, data.password)

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new Error(authErrors.getErrorMessage(result.error))
      }

      return result
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useRegisterMutation() {
  const { signUp } = useAuth()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const result = await signUp(data.email, data.password)

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new Error(authErrors.getErrorMessage(result.error))
      }

      return result
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useGoogleSignInMutation() {
  const { signInWithGoogle } = useAuth()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      const result = await signInWithGoogle()

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new Error(authErrors.getErrorMessage(result.error))
      }

      return result
    },
    onError: (error: Error) => {
      toast({
        title: 'Google sign in failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useForgotPasswordMutation() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const result = await resetPassword(data.email)

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new Error(authErrors.getErrorMessage(result.error))
      }

      return { email: data.email }
    },
    onError: (error: Error) => {
      toast({
        title: 'Password reset failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useResetPasswordMutation() {
  const { toast } = useToast()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const { authErrors } = await import('@/lib/auth/auth-helpers')
      const supabase = (await import('@/lib/supabase/client')).createClient()
      
      console.log('Attempting password update...')
      
      // Step 2: Update password for authenticated user
      // User should already have an active session from clicking the email link
      const result = await supabase.auth.updateUser({ 
        password: data.password 
      })
      
      if (result.error) {
        console.error('Password update failed:', result.error)
        throw new Error(authErrors.getErrorMessage(result.error))
      }
      
      console.log('Password updated successfully')
      return result
    },
    onSuccess: () => {
      toast({
        title: 'Password updated successfully',
        description: 'You can now sign in with your new password.',
      })
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Password update failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useResendConfirmationMutation() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (email: string) => {
    
      const result = await authClient.resendConfirmation(email)

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new Error(authErrors.getErrorMessage(result.error))
      }

      return result
    },
    onSuccess: () => {
      toast({
        title: 'Confirmation email sent',
        description: 'Please check your email for the confirmation link.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send confirmation email',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteAccountMutation() {
  const { signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      return response.json()
    },
    onSuccess: async () => {
      toast({
        title: 'Account deleted',
        description: 'Your account has been successfully deleted.',
      })
      
      // Sign out and redirect to home page
      await signOut()
      router.push('/')
    },
    onError: (error: Error) => {
      toast({
        title: 'Account deletion failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}