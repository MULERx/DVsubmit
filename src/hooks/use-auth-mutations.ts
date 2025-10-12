import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { authErrors, authClient } from '@/lib/auth/auth-helpers'
import { useToast } from '@/hooks/use-toast'
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordMutationData
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
    mutationFn: async (data: ResetPasswordMutationData) => {
      const { authErrors } = await import('@/lib/auth/auth-helpers')
      const supabase = (await import('@/lib/supabase/client')).createClient()
      
      console.log('Attempting password update...')
      
      // According to latest Supabase docs, if user clicked the email link,
      // they should already have an active session. Just update the password.
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
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
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