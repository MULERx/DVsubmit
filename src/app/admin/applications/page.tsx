"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { withAuth } from "@/lib/auth/auth-context";
import { useAdminApplications } from "@/hooks/use-admin-applications-queries";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { AdminHeader } from "@/components/admin/admin-header";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function ApplicationsManagementPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, error, refetch, isRefetching } =
    useAdminApplications({
      page,
      limit: 10,
      status: statusFilter || undefined,
    });

  // Get page title based on type
  const getPageTitle = () => {
    switch (typeParam) {
      case "pendingPayment":
        return "Pending Payment Verification";
      case "pendingReview":
        return "Pending Review & Submit";
      case "paymentRejected":
        return "Payment Rejected";
      case "applicationRejected":
        return "Application Rejected";
      case "submitted":
        return "Submitted Applications";
      default:
        return "All Applications";
    }
  };

  const getPageDescription = () => {
    switch (typeParam) {
      case "pendingPayment":
        return "Applications awaiting payment verification from oldest to newest.";
      case "pendingReview":
        return "Applications with verified payments ready for DV submission.";
      case "paymentRejected":
        return "Applications with rejected payments that need resubmission.";
      case "applicationRejected":
        return "Applications rejected by admins that need corrections.";
      case "submitted":
        return "Applications successfully submitted to the DV system.";
      default:
        return "View and manage all DV lottery applications in the system.";
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        breadcrumbs={[
          { label: "Admin Panel", href: "/admin" },
          { label: "Applications Management" },
        ]}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {getPageDescription()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Status Filter - Only show if not filtered by type */}
          {!typeParam && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    statusFilter === ""
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } border border-gray-300`}
                >
                  All Applications
                </button>
                {[
                  { key: "PAYMENT_PENDING", label: "Payment Pending" },
                  { key: "PAYMENT_VERIFIED", label: "Payment Verified" },
                  { key: "PAYMENT_REJECTED", label: "Payment Rejected" },
                  {
                    key: "APPLICATION_REJECTED",
                    label: "Application Rejected",
                  },
                  { key: "SUBMITTED", label: "Submitted" },
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => setStatusFilter(status.key)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      statusFilter === status.key
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border border-gray-300`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <div className="text-sm text-red-700">
                    {error instanceof Error
                      ? error.message
                      : "Failed to load applications"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {data && (
            <ApplicationsTable
              applications={data.applications}
              pagination={{
                page: data.page,
                limit: data.limit,
                total: data.total,
                totalPages: Math.ceil(data.total / data.limit),
              }}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(ApplicationsManagementPage, { requireAdmin: true });
