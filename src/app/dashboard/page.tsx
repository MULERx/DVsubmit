'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { AdminOnly } from '@/lib/auth/role-guard'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Home } from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()

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
           <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="https://ntzsbuboifpexxmkaifi.supabase.co/storage/v1/object/public/dv/dvsubmit-logo.webp"  priority alt="DVSubmit Logo" width={20} height={20} className="sm:h-12 h-10 w-10 sm:w-12"  />
              <span className="text-xl font-bold text-gray-900">DVSubmit</span>
            </Link>
              <h1 className="hidden sm:block text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="hidden sm:flex text-sm text-indigo-600 hover:text-indigo-700 font-medium items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>

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
                  className="hidden sm:block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Admin Panel
                </Link>
              </AdminOnly>

              <button
                onClick={handleSignOut}
                className="text-sm cursor-pointer text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-2 sm:py-6">
          <UserDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <Image src="https://ntzsbuboifpexxmkaifi.supabase.co/storage/v1/object/public/dv/dvsubmit-logo.webp" alt="DVSubmit Logo" width={20} height={20} className="sm:h-12 h-10 w-10 sm:w-12"  />
              <span className="text-xl font-semibold">DVSubmit</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm">
              <div className="flex items-center gap-6">
                <Link href="/terms" className="hover:text-gray-300 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-gray-300 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/help" className="hover:text-gray-300 transition-colors">
                  Help
                </Link>
              </div>
              <span className="text-gray-400 text-center sm:text-left">
                © 2024 DVSubmit. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}