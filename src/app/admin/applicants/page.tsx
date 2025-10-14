"use client"

import { useState } from 'react'
import { withAuth } from '@/lib/auth/auth-context'
import { SuperAdminOnly } from '@/lib/auth/role-guard'
import { AdminHeader } from '@/components/admin/admin-header'
import { useApplicants, useBlockApplicant, useUnblockApplicant, type Applicant } from '@/hooks/use-applicants'
import { ApplicantsTable } from '@/components/admin/applicants-table'
import { ApplicantsFilters } from '@/components/admin/applicants-filters'
import { ApplicantDetailsModal } from '@/components/admin/applicant-details-modal'
import {
    Users,
    UserCheck,
    UserX,
    Filter,
    RefreshCw
} from 'lucide-react'

function ApplicantsManagementPage() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'active' | 'blocked' | 'all'>('all')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const { data, isLoading, error, refetch } = useApplicants({
        page,
        limit,
        search,
        status,
        sortBy,
        sortOrder
    })

    const blockMutation = useBlockApplicant()
    const unblockMutation = useUnblockApplicant()

    const applicants = data?.applicants || []
    const pagination = data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit)
        setPage(1) // Reset to first page when changing limit
    }

    const handleSearch = (searchTerm: string) => {
        setSearch(searchTerm)
        setPage(1) // Reset to first page when searching
    }

    const handleStatusFilter = (newStatus: 'active' | 'blocked' | 'all') => {
        setStatus(newStatus)
        setPage(1) // Reset to first page when filtering
    }

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
        setPage(1) // Reset to first page when sorting
    }

    const handleBlockApplicant = (userId: string) => {
        blockMutation.mutate(userId)
    }

    const handleUnblockApplicant = (userId: string) => {
        unblockMutation.mutate(userId)
    }

    const handleViewApplicant = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setModalOpen(true)
    }

    const activeApplicants = applicants.filter(a => !a.blocked).length
    const blockedApplicants = applicants.filter(a => a.blocked).length

    if (isLoading && page === 1) {
        return (
            <SuperAdminOnly>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            </SuperAdminOnly>
        )
    }

    return (
        <SuperAdminOnly>
            <div className="min-h-screen bg-gray-50">
                <AdminHeader
                    breadcrumbs={[
                        { label: "Admin Panel", href: "/admin" },
                        { label: "Applicants Management" }
                    ]}
                />

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Applicants Management</h1>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Manage applicant accounts and view their applications
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => refetch()}
                                        disabled={isLoading}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                    </button>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Users className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Total Applicants
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {pagination.total.toLocaleString()}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <UserCheck className="h-6 w-6 text-green-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Active Applicants
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {activeApplicants}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <UserX className="h-6 w-6 text-red-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Blocked Applicants
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {blockedApplicants}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Users className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Current Page
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {pagination.page} of {pagination.totalPages}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="mb-6">
                                <ApplicantsFilters
                                    search={search}
                                    status={status}
                                    onSearchChange={handleSearch}
                                    onStatusChange={handleStatusFilter}
                                    loading={isLoading}
                                />
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Error loading applicants
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error.message}</p>
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                onClick={() => refetch()}
                                                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Applicants Table */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ApplicantsTable
                                applicants={applicants}
                                loading={isLoading}
                                pagination={pagination}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onPageChange={handlePageChange}
                                onLimitChange={handleLimitChange}
                                onSort={handleSort}
                                onBlockApplicant={handleBlockApplicant}
                                onUnblockApplicant={handleUnblockApplicant}
                                onViewApplicant={handleViewApplicant}
                                blockingUserId={blockMutation.isPending ? blockMutation.variables : null}
                                unblockingUserId={unblockMutation.isPending ? unblockMutation.variables : null}
                            />
                        </div>
                    </div>
                </main>

                {/* Applicant Details Modal */}
                <ApplicantDetailsModal
                    applicant={selectedApplicant}
                    open={modalOpen}
                    onOpenChange={(open) => {
                        setModalOpen(open)
                        if (!open) {
                            setSelectedApplicant(null)
                        }
                    }}
                />
            </div>
        </SuperAdminOnly>
    )
}

export default withAuth(ApplicantsManagementPage, { requireSuperAdmin: true })