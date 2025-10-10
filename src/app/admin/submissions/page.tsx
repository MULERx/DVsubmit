'use client'

import { useState, useEffect } from 'react'
import { withAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { Send, CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  confirmationNumber?: string
  submittedAt?: string
  submittedBy?: string
  paymentVerifiedAt: string
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

function DvSubmissionPage() {
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
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [updateStatus, setUpdateStatus] = useState<'SUBMITTED' | 'CONFIRMED' | 'FAILED'>('CONFIRMED')
  const [statusFilter, setStatusFilter] = useState('PAYMENT_VERIFIED')

  useEffect(() => {
    fetchApplications()
  }, [pagination.page, statusFilter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/submissions?status=${statusFilter}&page=${pagination.page}&limit=${pagination.limit}`
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

  const handleSubmitToDv = async () => {
    if (!selectedApp || !confirmationNumber.trim()) return

    setProcessingId(selectedApp.id)
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          confirmationNumber: confirmationNumber.trim(),
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the application in the list or remove it if filtering by PAYMENT_VERIFIED
        if (statusFilter === 'PAYMENT_VERIFIED') {
          setApplications(applications.filter(app => app.id !== selectedApp.id))
        } else {
          setApplications(applications.map(app => 
            app.id === selectedApp.id 
              ? { ...app, status: 'SUBMITTED', confirmationNumber: confirmationNumber.trim(), submittedAt: new Date().toISOString() }
              : app
          ))
        }
        
        setShowSubmitModal(false)
        setSelectedApp(null)
        setConfirmationNumber('')
        setNotes('')
        setError('')
      } else {
        setError(data.error?.message || 'Failed to submit to DV system')
      }
    } catch {
      setError('Failed to submit to DV system')
    } finally {
      setProcessingId(null)
    }
  }

  const handleUpdateSubmission = async () => {
    if (!selectedApp) return

    setProcessingId(selectedApp.id)
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          status: updateStatus,
          confirmationNumber: confirmationNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the application in the list
        setApplications(applications.map(app => 
          app.id === selectedApp.id 
            ? { 
                ...app, 
                status: updateStatus, 
                confirmationNumber: confirmationNumber.trim() || app.confirmationNumber,
                submittedAt: updateStatus === 'CONFIRMED' && !app.submittedAt ? new Date().toISOString() : app.submittedAt
              }
            : app
        ))
        
        setShowUpdateModal(false)
        setSelectedApp(null)
        setConfirmationNumber('')
        setNotes('')
        setUpdateStatus('CONFIRMED')
        setError('')
      } else {
        setError(data.error?.message || 'Failed to update submission')
      }
    } catch {
      setError('Failed to update submission')
    } finally {
      setProcessingId(null)
    }
  }

  const openSubmitModal = (app: Application) => {
    setSelectedApp(app)
    setShowSubmitModal(true)
    setConfirmationNumber('')
    setNotes('')
  }

  const openUpdateModal = (app: Application) => {
    setSelectedApp(app)
    setShowUpdateModal(true)
    setConfirmationNumber(app.confirmationNumber || '')
    setNotes('')
    setUpdateStatus('CONFIRMED')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready for Submission
          </span>
        )
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Send className="w-3 h-3 mr-1" />
            Submitted to DV
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
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
              <h1 className="text-xl font-semibold text-gray-900">DV Submission Management</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Official DV Submission</h2>
            <p className="mt-1 text-sm text-gray-600">
              Submit verified applications to the official U.S. DV lottery system and track confirmation numbers.
            </p>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="sm:hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="PAYMENT_VERIFIED">Ready for Submission</option>
                <option value="SUBMITTED">Submitted to DV</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-8">
                {[
                  { key: 'PAYMENT_VERIFIED', label: 'Ready for Submission' },
                  { key: 'SUBMITTED', label: 'Submitted to DV' },
                  { key: 'CONFIRMED', label: 'Confirmed' },
                  { key: 'FAILED', label: 'Failed' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      statusFilter === tab.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
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
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No applications found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter === 'PAYMENT_VERIFIED' 
                    ? 'No applications are ready for DV submission.'
                    : `No applications with status "${statusFilter}".`
                  }
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
                              {app.confirmationNumber && (
                                <>
                                  <span className="mx-2">•</span>
                                  <p>Confirmation: <span className="font-mono">{app.confirmationNumber}</span></p>
                                </>
                              )}
                              <span className="mx-2">•</span>
                              <p>
                                {app.submittedAt 
                                  ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                                  : `Payment verified ${new Date(app.paymentVerifiedAt).toLocaleDateString()}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {app.status === 'PAYMENT_VERIFIED' && (
                            <button
                              onClick={() => openSubmitModal(app)}
                              disabled={processingId === app.id}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Submit to DV
                            </button>
                          )}
                          {(app.status === 'SUBMITTED' || app.status === 'CONFIRMED' || app.status === 'FAILED') && (
                            <button
                              onClick={() => openUpdateModal(app)}
                              disabled={processingId === app.id}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Update Status
                            </button>
                          )}
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

      {/* Submit to DV Modal */}
      {showSubmitModal && selectedApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center">
                <Send className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Submit to DV System</h3>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {selectedApp.firstName} {selectedApp.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedApp.user.email}
                </p>
              </div>
              <div className="mt-4">
                <label htmlFor="confirmationNumber" className="block text-sm font-medium text-gray-700">
                  DV Confirmation Number *
                </label>
                <input
                  type="text"
                  id="confirmationNumber"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter confirmation number from DV system"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="submitNotes" className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  id="submitNotes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Add any notes about this submission..."
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleSubmitToDv}
                  disabled={processingId === selectedApp.id || !confirmationNumber.trim()}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {processingId === selectedApp.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  Submit to DV
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false)
                    setSelectedApp(null)
                    setConfirmationNumber('')
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

      {/* Update Submission Modal */}
      {showUpdateModal && selectedApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Update Submission Status</h3>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {selectedApp.firstName} {selectedApp.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Status:</strong> {selectedApp.status}
                </p>
                {selectedApp.confirmationNumber && (
                  <p className="text-sm text-gray-600">
                    <strong>Current Confirmation:</strong> <span className="font-mono">{selectedApp.confirmationNumber}</span>
                  </p>
                )}
              </div>
              <div className="mt-4">
                <label htmlFor="updateStatus" className="block text-sm font-medium text-gray-700">
                  New Status
                </label>
                <select
                  id="updateStatus"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as 'SUBMITTED' | 'CONFIRMED' | 'FAILED')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="mt-4">
                <label htmlFor="updateConfirmationNumber" className="block text-sm font-medium text-gray-700">
                  Confirmation Number
                </label>
                <input
                  type="text"
                  id="updateConfirmationNumber"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter or update confirmation number"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="updateNotes" className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  id="updateNotes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Add any notes about this update..."
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleUpdateSubmission}
                  disabled={processingId === selectedApp.id}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {processingId === selectedApp.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedApp(null)
                    setConfirmationNumber('')
                    setNotes('')
                    setUpdateStatus('CONFIRMED')
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

export default withAuth(DvSubmissionPage, { requireAdmin: true })