'use client'

import { useState, useEffect } from 'react'
import { withAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  paymentReference: string
  paymentStatus: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    createdAt: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

function PaymentVerificationPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [verificationAction, setVerificationAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [pagination.page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/applications?status=PAYMENT_PENDING&page=${pagination.page}&limit=${pagination.limit}`
      )
      const data = await response.json()

      if (response.ok) {
        setApplications(data.data.applications)
        setPagination(data.data.pagination)
      } else {
        setError(data.error?.message || 'Failed to fetch applications')
      }
    } catch {
      setError('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (applicationId: string, action: 'approve' | 'reject') => {
    setProcessingId(applicationId)
    try {
      const response = await fetch('/api/admin/payments/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          action,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the processed application from the list
        setApplications(applications.filter(app => app.id !== applicationId))
        setShowModal(false)
        setSelectedApp(null)
        setNotes('')
        setVerificationAction(null)
        
        // Show success message
        setError('')
      } else {
        setError(data.error?.message || `Failed to ${action} payment`)
      }
    } catch {
      setError(`Failed to ${action} payment`)
    } finally {
      setProcessingId(null)
    }
  }

  const openVerificationModal = (app: Application, action: 'approve' | 'reject') => {
    setSelectedApp(app)
    setVerificationAction(action)
    setShowModal(true)
    setNotes('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Payment Verification</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Telebirr Payment Verification</h2>
            <p className="mt-1 text-sm text-gray-600">
              Review and verify Telebirr payment references submitted by users.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending payments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All payment references have been processed.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <li key={app.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {app.firstName?.charAt(0)}{app.lastName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {app.firstName} {app.lastName}
                              </p>
                              {getStatusBadge(app.status)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <p>{app.user.email}</p>
                              <span className="mx-2">•</span>
                              <p>Payment Ref: <span className="font-mono">{app.paymentReference}</span></p>
                              <span className="mx-2">•</span>
                              <p>Submitted {new Date(app.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openVerificationModal(app, 'approve')}
                            disabled={processingId === app.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => openVerificationModal(app, 'reject')}
                            disabled={processingId === app.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                          {processingId === app.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Verification Modal */}
      {showModal && selectedApp && verificationAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center">
                {verificationAction === 'approve' ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                )}
                <h3 className="text-lg font-medium text-gray-900">
                  {verificationAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </h3>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {selectedApp.firstName} {selectedApp.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedApp.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Payment Reference:</strong> <span className="font-mono">{selectedApp.paymentReference}</span>
                </p>
              </div>
              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Add any notes about this verification..."
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleVerifyPayment(selectedApp.id, verificationAction)}
                  disabled={processingId === selectedApp.id}
                  className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    verificationAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {processingId === selectedApp.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  Confirm {verificationAction === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedApp(null)
                    setVerificationAction(null)
                    setNotes('')
                  }}
                  disabled={processingId === selectedApp.id}
                  className="flex-1 inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default withAuth(PaymentVerificationPage, { requireAdmin: true })