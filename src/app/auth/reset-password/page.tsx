'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Eye, EyeOff, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { useResetPasswordMutation } from '@/hooks/use-auth-mutations'

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const resetPasswordMutation = useResetPasswordMutation()

  // Check if we have valid session/tokens for password reset
  useEffect(() => {
    const checkSession = async () => {

      // Additional debug: Check if this looks like a malformed email link
      const hasError = searchParams.get('error')
      const hasTokens = searchParams.get('access_token') || searchParams.get('token')

      if (hasError && !hasTokens) {
        console.warn('🚨 This looks like a Supabase configuration issue!')
        console.log('Expected URL format: /auth/reset-password?token=...&type=recovery')
        console.log('Actual URL format: /auth/reset-password?error=...')
        console.log('👉 Check your Supabase email template and Site URL configuration')
      }

      // Check for error parameters first
      const urlError = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')

      if (urlError) {
        let errorMessage = 'An error occurred with the password reset link.'

        if (errorCode === 'otp_expired' || urlError === 'access_denied') {
          errorMessage = `🚨 Supabase Configuration Issue Detected

This error occurs immediately because of incorrect Supabase dashboard settings.

**Required Fixes:**
1. Go to Supabase Dashboard → Settings → General
   Set Site URL to: ${process.env.NEXT_PUBLIC_APP_URL}

2. Go to Authentication → URL Configuration  
   Add Redirect URL: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password

3. Go to Authentication → Email Templates → Reset Password
   Use: {{ .SiteURL }}/auth/reset-password?token={{ .TokenHash }}&type=recovery

**Not a link expiration issue** - this happens instantly due to config mismatch.`
        } else if (errorDescription) {
          errorMessage = decodeURIComponent(errorDescription)
        }

        setError(errorMessage)
        setIsLoading(false)
        return
      }

      // Check if we have the necessary URL parameters or session
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const token = searchParams.get('token') // Supabase sends this for password reset
      const type = searchParams.get('type')

      // Check if we have an active session (which should be established by clicking the email link)
      try {
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Failed to get session. Please try clicking the email link again.')
          setIsLoading(false)
          return
        }

        if (sessionData?.session?.user) {
          console.log('✅ Active session found - user can reset password')
          setIsValidSession(true)
        } else {
          console.log('❌ No active session found')

          // Check if we have URL parameters as fallback
          const token = searchParams.get('token')
          const type = searchParams.get('type')

          if (type === 'recovery' && token) {
            console.log('Found recovery token in URL, allowing password reset')
            setIsValidSession(true)
          } else {
            console.log('No session and no valid tokens, redirecting to forgot password')
            router.push('/forgot-password')
            return
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setError('Failed to verify session')
        setIsLoading(false)
        return
      }

      setIsLoading(false)
    }

    checkSession()
  }, [searchParams, router])

  const onSubmit = (data: ResetPasswordFormData) => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const token = searchParams.get('token')

    resetPasswordMutation.mutate({
      ...data,
      accessToken: accessToken || undefined,
      refreshToken: refreshToken || undefined,
      token: token || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-gray-900">DVSubmit</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Link Expired
              </h1>
              <div className="text-gray-600 mb-8 text-left">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {error}
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium mb-1">Debug Info (Development Only):</p>
                    <p className="text-xs text-yellow-700">
                      Current App URL: {process.env.NEXT_PUBLIC_APP_URL}
                    </p>
                    <p className="text-xs text-yellow-700">
                      Check console for detailed URL parameters
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Request New Reset Link
                </Link>
                <Link
                  href="/login"
                  className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors inline-block"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return null // Will redirect
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">DVSubmit</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Reset your password
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Enter your new password below.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {resetPasswordMutation.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-sm text-red-700">{resetPasswordMutation.error.message}</div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter your new password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Confirm your new password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {resetPasswordMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating password...
                  </div>
                ) : (
                  'Update password'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}