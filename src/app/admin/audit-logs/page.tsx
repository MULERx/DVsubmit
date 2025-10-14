"use client";

import { useState } from "react";
import { withAuth } from "@/lib/auth/auth-context";
import { SuperAdminOnly } from "@/lib/auth/role-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import {
    Filter,
    RefreshCw,
    Calendar,
    User,
    FileText,
    Activity,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { AuditLogsTable } from "@/components/admin/audit-logs-table";
import { AuditLogsFilters } from "@/components/admin/audit-logs-filters";
import { AuditLogDetails } from "@/components/admin/audit-log-details";
import { useAuditLogs, type AuditLog, type AuditLogsFilters as Filters } from "@/hooks/use-audit-logs";

function AuditLogsPage() {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>({
        action: "",
        userId: "",
        applicationId: "",
        startDate: "",
        endDate: "",
        search: ""
    });

    const { data, isLoading, error, refetch } = useAuditLogs({
        page,
        limit: 50,
        ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value)
        )
    });

    const auditLogs = data?.auditLogs || [];
    const pagination = data?.pagination || {
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    };

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRefresh = () => {
        refetch();
    };



    return (
        <SuperAdminOnly>
            <div className="min-h-screen bg-gray-50">
                <AdminHeader
                    breadcrumbs={[
                        { label: "Admin Panel", href: "/admin" },
                        { label: "Audit Logs" }
                    ]}
                />

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Monitor and track all system activities and user actions
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleRefresh}
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
                                                <Activity className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Total Logs
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {pagination.totalCount.toLocaleString()}
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
                                                <Calendar className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Today's Logs
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {auditLogs.filter(log =>
                                                            new Date(log.createdAt).toDateString() === new Date().toDateString()
                                                        ).length}
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
                                                <User className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Unique Users
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {new Set(auditLogs.map(log => log.user?.id).filter(Boolean)).size}
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
                                                <FileText className="h-6 w-6 text-gray-400" />
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
                                <AuditLogsFilters
                                    filters={filters}
                                    onFiltersChange={handleFilterChange}
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
                                            Error loading audit logs
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error.message}</p>
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                onClick={handleRefresh}
                                                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Audit Logs Table */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <AuditLogsTable
                                auditLogs={auditLogs}
                                loading={isLoading}
                                onSelectLog={setSelectedLog}
                            />

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={!pagination.hasPrev}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={!pagination.hasNext}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing{" "}
                                                <span className="font-medium">
                                                    {(pagination.page - 1) * pagination.limit + 1}
                                                </span>{" "}
                                                to{" "}
                                                <span className="font-medium">
                                                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-medium">{pagination.totalCount}</span>{" "}
                                                results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() => handlePageChange(pagination.page - 1)}
                                                    disabled={!pagination.hasPrev}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>

                                                {/* Page numbers */}
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    const pageNum = Math.max(1, pagination.page - 2) + i;
                                                    if (pageNum > pagination.totalPages) return null;

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === pagination.page
                                                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => handlePageChange(pagination.page + 1)}
                                                    disabled={!pagination.hasNext}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Audit Log Details Modal */}
                {selectedLog && (
                    <AuditLogDetails
                        auditLog={selectedLog}
                        onClose={() => setSelectedLog(null)}
                    />
                )}
            </div>
        </SuperAdminOnly>
    );
}

export default withAuth(AuditLogsPage, { requireSuperAdmin: true });