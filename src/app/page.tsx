'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { LegalAcknowledgmentModal } from '@/components/legal/legal-acknowledgment-modal'
import { FirstVisitBanner } from '@/components/legal/legal-banner'
import { useLegalAcknowledgment } from '@/hooks/use-legal-acknowledgment'
import { FileText, Users, Shield, CheckCircle } from 'lucide-react'

export default function Home() {
  const [showLegalModal, setShowLegalModal] = useState(false)
  const { needsAcknowledgment, acknowledgeTerms, isLoading } = useLegalAcknowledgment()

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Legal Acknowledgment Modal */}
      <LegalAcknowledgmentModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        onAcknowledge={handleLegalAcknowledgment}
        variant="first-visit"
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DVSubmit</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                Privacy
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Legal Banner */}
      {!isLoading && needsAcknowledgment && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <FirstVisitBanner />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional DV Lottery Assistance
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get expert help with your Diversity Visa lottery application. We provide secure,
            professional assistance to ensure your application meets all requirements.
          </p>

          {/* Important Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800 font-semibold mb-2">
              <Shield className="h-5 w-5" />
              Important Notice
            </div>
            <p className="text-sm text-yellow-700">
              This is a private service. We are NOT affiliated with the U.S. Government.
              Selection in the DV lottery is not guaranteed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-40">
                Start Application
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" size="lg">
                View Terms & Conditions
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Assistance</h3>
            <p className="text-gray-600 text-sm">
              Expert help completing your DV lottery application with all required information
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Validation</h3>
            <p className="text-gray-600 text-sm">
              Ensure your photo meets all DV lottery requirements before submission
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Submission</h3>
            <p className="text-gray-600 text-sm">
              Professional submission to the official DV lottery system on your behalf
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Register</h4>
              <p className="text-sm text-gray-600">Create your account and verify your email</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Complete Form</h4>
              <p className="text-sm text-gray-600">Fill out your DV application with our guidance</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pay Fee</h4>
              <p className="text-sm text-gray-600">Pay 399 ETB service fee via Telebirr</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Confirmation</h4>
              <p className="text-sm text-gray-600">Receive your official DV confirmation number</p>
            </div>
          </div>
        </div>

        {/* Final Legal Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-red-800 mb-2">Legal Disclaimer</h3>
          <p className="text-sm text-red-700 mb-4">
            DVSubmit is a private company providing DV lottery assistance services. We are not
            affiliated with the U.S. Government or Department of State. Using our service does
            not guarantee selection in the DV lottery.
          </p>
          <Link href="/terms" className="text-red-600 hover:text-red-800 text-sm font-medium underline">
            Read Full Terms & Conditions
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">DVSubmit</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
              <Link href="/help" className="hover:text-gray-300">
                Help
              </Link>
              <span className="text-gray-400">
                © 2024 DVSubmit. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
