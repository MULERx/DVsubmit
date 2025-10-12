'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { AdminOnly, SuperAdminOnly } from '@/lib/auth/role-guard'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, userWithRole, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">DVSubmit Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">

                <Link
                  href="/profile"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Profile
                </Link>

              {/* Admin Links */}
              <AdminOnly>
                <Link
                  href="/admin"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Admin Panel
                </Link>
              </AdminOnly>

              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <UserDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@dvsubmit.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                support@dvsubmit.com
              </a>
              {' '}or call{' '}
              <a
                href="tel:+1-555-0123"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                +251 955 55 55 55
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © 2024 DVSubmit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}