"use client";

import { Calendar, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { type Applicant } from "@/hooks/use-applicants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApplicantDetailsModalProps {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicantDetailsModal({
  applicant,
  open,
  onOpenChange,
}: ApplicantDetailsModalProps) {
  if (!applicant) return null;
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "APPLICATION_REJECTED":
      case "PAYMENT_REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "PAYMENT_VERIFIED":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "SUBMITTED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "APPLICATION_REJECTED":
      case "PAYMENT_REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "PAYMENT_VERIFIED":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "PAYMENT_PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-700">
                  {applicant.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900">
                Applicant Details
              </div>
              <div className="text-sm text-gray-500">{applicant.email}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Info */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Account Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{applicant.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  {applicant.blocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Joined</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(applicant.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Applications
                </dt>
                <dd className="text-sm text-gray-900">
                  {applicant._count.applications}
                </dd>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Applications
            </h4>

            {applicant.applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No applications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This applicant hasn&apos;t submitted any applications yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicant.applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(application.status)}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {application.givenName} {application.familyName}
                          </h5>
                          <p className="text-sm text-gray-500">
                            Application ID: {application.id}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Created:{" "}
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </div>
                            {application.submittedAt && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Submitted:{" "}
                                {new Date(
                                  application.submittedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {application.confirmationNumber && (
                            <p className="mt-1 text-sm text-gray-500">
                              Confirmation: {application.confirmationNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={getStatusBadge(application.status)}>
                          {formatStatus(application.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
