'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { LegalAcknowledgmentModal } from '@/components/legal/legal-acknowledgment-modal'
import { useLegalAcknowledgment } from '@/hooks/use-legal-acknowledgment'
import { useAuth } from '@/lib/auth/auth-context'
import { FileText, Shield, CheckCircle, Settings, BarChart3, Menu, X } from 'lucide-react'

export default function Home() {
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { needsAcknowledgment, acknowledgeTerms, isLoading } = useLegalAcknowledgment()
  const { isAuthenticated, isAdmin, isSuperAdmin, loading: authLoading } = useAuth()

  // Show legal modal for first-time visitors
  useEffect(() => {
    if (!isLoading && needsAcknowledgment) {
      const timer = setTimeout(() => {
        setShowLegalModal(true)
      }, 1000) // Show after 1 second to let page load

      return () => clearTimeout(timer)
    }
  }, [needsAcknowledgment, isLoading])

  const handleLegalAcknowledgment = async () => {
    await acknowledgeTerms('first-visit')
    setShowLegalModal(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Legal Acknowledgment Modal */}
      <LegalAcknowledgmentModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        onAcknowledge={handleLegalAcknowledgment}
        variant="first-visit"
      />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl ">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DVSubmit</h1>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Privacy
                </Link>
              </div>

              {authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600 hidden sm:inline">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/login" className="hidden sm:block">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {isSuperAdmin || isAdmin ? (
                        <Link href="/admin">
                          <Button variant="outline" size="sm" className="flex items-center gap-2 border-gray-200 hover:bg-gray-50">
                            <Settings className="h-4 w-4" />
                            <span >Admin Panel</span>
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/dashboard">
                          <Button variant="outline" size="sm" className="flex items-center gap-2 border-gray-200 hover:bg-gray-50">
                            <BarChart3 className="h-4 w-4" />
                            <span >Dashboard</span>
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-100 bg-white">
              <div className="px-4 py-4 space-y-3">
                <Link
                  href="/terms"
                  className="block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Privacy
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>



      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-6 leading-tight">
              Professional DV Lottery
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Assistance
              </span>
            </h1>
            <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Get expert help with your Diversity Visa lottery application. We provide secure,
              professional assistance to ensure your application meets all requirements.
            </p>

            {/* Important Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-amber-800 font-semibold mb-2">
                <Shield className="h-5 w-5" />
                Important Notice
              </div>
              <p className="text-sm sm:text-base text-amber-700">
                This is a private service. We are NOT affiliated with the U.S. Government.
                Selection in the DV lottery is not guaranteed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {authLoading ? (
                <div className="flex items-center justify-center gap-3 py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading...</span>
                </div>
              ) : (
                <>
                  {!isAuthenticated ? (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg px-8 py-3 text-base font-semibold">
                          Start Application
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {isSuperAdmin || isAdmin ? (
                        <>
                          <Link href="/admin">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg flex items-center gap-2 px-8 py-3 text-base font-semibold">
                              <Settings className="h-5 w-5" />
                              Admin Panel
                            </Button>
                          </Link>
                          <Link href="/dashboard">
                            <Button variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-8 py-3 text-base">
                              <BarChart3 className="h-5 w-5" />
                              My Dashboard
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/dashboard">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg flex items-center gap-2 px-8 py-3 text-base font-semibold">
                              <BarChart3 className="h-5 w-5" />
                              Dashboard
                            </Button>
                          </Link>
                          <Link href="/dv-form">
                            <Button variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 px-8 py-3 text-base">
                              Continue Application
                            </Button>
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Form Assistance</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Expert help completing your DV lottery application with all required information
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Photo Validation</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Ensure your photo meets all DV lottery requirements before submission
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Submission</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Professional submission to the official DV lottery system on your behalf
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 sm:p-12 border border-gray-100">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold ">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Register</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Create your account and verify your email</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold ">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Complete Form</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Fill out your DV application with our guidance</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold ">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Pay Fee</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Pay 399 ETB service fee via Telebirr</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold ">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Get Confirmation</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Receive your official DV confirmation number</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Legal Disclaimer</h3>
            <p className="text-red-700 mb-4 leading-relaxed max-w-3xl mx-auto">
              DVSubmit is a private company providing DV lottery assistance services. We are not
              affiliated with the U.S. Government or Department of State. Using our service does
              not guarantee selection in the DV lottery.
            </p>
            <Link href="/terms" className="text-red-600 hover:text-red-800 font-medium underline transition-colors">
              Read Full Terms & Conditions
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
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
