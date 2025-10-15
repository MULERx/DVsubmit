"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplicationRecord } from "@/lib/types/application";
import { StatusBadge } from "./status-badge";
import {
  Clock,
  XCircle,
  CreditCard,
  Edit,
  Copy,
  Printer,
  User,
} from "lucide-react";

interface ApplicationCardProps {
  application: ApplicationRecord;
  onUpdatePayment?: (application: ApplicationRecord) => void;
  onEditApplication?: (applicationId: string) => void;
  onCopyConfirmation?: (confirmationNumber: string) => void;
  onPrintProof?: (
    applicationId: string,
    confirmationNumber: string,
    fullName: string,
    dateOfBirth: Date
  ) => void;
  isPrinting?: boolean;
  variant?: "pending" | "submitted";
}

export function ApplicationCard({
  application,
  onUpdatePayment,
  onEditApplication,
  onCopyConfirmation,
  onPrintProof,
  isPrinting = false,
  variant = "pending",
}: ApplicationCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fullName = `${application.givenName} ${application.middleName || ""} ${
    application.familyName
  }`.trim();

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex sm:flex-row flex-col gap-1 sm:items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 text-sm sm:text-lg">
                {fullName}
              </h3>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="flex justify-between gap-3 sm:gap-6">
          {/* Confirmation Number */}
          {variant === "submitted" && application.confirmationNumber && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-2 sm:mb-4 w-full">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-emerald-600 font-medium ">
                    Confirmation Number
                  </div>
                  <div className="font-mono text-sm font-semibold text-emerald-800 select-all">
                    {application.confirmationNumber}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onCopyConfirmation?.(application.confirmationNumber!)
                  }
                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:ml-auto">
            {application.status === "PAYMENT_REJECTED" && onUpdatePayment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdatePayment(application)}
                className="h-8 text-xs flex-1"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Update Payment
              </Button>
            )}
            {application.status === "APPLICATION_REJECTED" &&
              onEditApplication && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditApplication(application.id)}
                  className="h-8 text-xs flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Application
                </Button>
              )}
            {(application.status === "PAYMENT_PENDING" ||
              application.status === "PAYMENT_VERIFIED") && (
              <div className="flex items-center gap-1 text-xs text-slate-500 py-2">
                <Clock className="h-3 w-3" />
                Processing...
              </div>
            )}
            {variant === "submitted" &&
              application.confirmationNumber &&
              onPrintProof && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onPrintProof(
                      application.id,
                      application.confirmationNumber!,
                      fullName,
                      application.dateOfBirth
                    )
                  }
                  disabled={isPrinting}
                  className="h-8 text-xs"
                >
                  <Printer className="h-3 w-3 mr-1" />
                  {isPrinting ? "Opening..." : "Print"}
                </Button>
              )}
          </div>
        </div>

        {/* Key Details */}
        <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 space-y-2">
          <div className="flex sm:justify-between text-xs gap-2">
            <span className="text-slate-500">Date of Birth:</span>
            <span className="font-mono text-slate-700">
              {new Date(application.dateOfBirth).toISOString().split("T")[0]}
            </span>
          </div>

          {variant === "pending" && application.paymentReference && (
            <div className="flex sm:justify-between text-xs gap-2">
              <span className="text-slate-500">Payment Ref:</span>
              <span className="font-mono text-slate-700 truncate ml-2">
                {application.paymentReference}
              </span>
            </div>
          )}
          {variant === "submitted" && application.submittedAt && (
            <div className="flex sm:justify-between text-xs gap-2">
              <span className="text-slate-500">Submitted:</span>
              <span className="text-slate-700">
                {formatDate(application.submittedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Rejection Note */}
        {application.status === "APPLICATION_REJECTED" &&
          application.rejectionNote && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-red-700 leading-relaxed mb-1">
                    {application.rejectionNote}
                  </p>
                  <p className="text-xs text-red-600 opacity-75">
                    Please edit your application to address these issues.
                  </p>
                </div>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
