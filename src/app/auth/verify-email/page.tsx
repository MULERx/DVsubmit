'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { AuthHeader } from '@/components/auth/auth-header'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    const type = searchParams.get('type')

    if (type === 'signup' && user) {
      // User has successfully verified their email
      setStatus('success')
      setMessage('Your email has been verified successfully!')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } else if (type === 'signup' && !user) {
      setStatus('error')
      setMessage('Email verification failed. Please try signing up again.')
    } else if (!user) {
      setStatus('error')
      setMessage('Please check your email and click the verification link.')
    } else {
      // User is already logged in and verified
      router.push('/dashboard')
    }
  }, [user, searchParams, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <AuthHeader />
        <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <AuthHeader backLink={{ href: status === 'success' ? "/dashboard" : "/login", label: status === 'success' ? "Go to Dashboard" : "Back to Sign In" }} />

      <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className={`bg-gradient-to-r ${status === 'success' ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}>
              {status === 'success' ? (
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {status === 'success' && (
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to dashboard in a few seconds...
              </p>
            )}

            <div className="space-y-3">
              {status === 'success' ? (
                <Link
                  href="/dashboard"
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block text-center"
                  >
                    Try Again
                  </Link>
                  <Link
                    href="/login"
                    className="w-full cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <AuthHeader />
        <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}