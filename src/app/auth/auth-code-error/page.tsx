import Link from 'next/link';
import { AuthHeader } from '@/components/auth/auth-header';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <AuthHeader backLink={{ href: "/login", label: "Back to Sign In" }} />
      
      <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Authentication Error
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sorry, we couldn&apos;t authenticate you. This could be due to an expired or invalid authentication code.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block text-center"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="w-full cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block text-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}