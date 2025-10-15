"use client";

import { useParams } from "next/navigation";
import { withAuth } from "@/lib/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAdminApplication } from "@/hooks/use-admin-application-queries";
import {
  usePaymentStatusMutation,
  useApplicationRejectionMutation,
  useApplicationSubmissionMutation,
} from "@/hooks/use-admin-application-mutations";
import { useSignedUrl } from "@/hooks/use-photo-queries";
import { RejectApplicationDialog } from "@/components/admin/reject-application-dialog";
import {
  ApprovePaymentDialog,
  RejectPaymentDialog,
} from "@/components/admin/payment-confirmation-dialogs";
import { SubmitApplicationDialog } from "@/components/admin/submit-application-dialog";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  User,
  Mail,
  MapPin,
  GraduationCap,
  Heart,
  Baby,
  RefreshCw,
  Download,
  Camera,
  CreditCard,
  Shield,
  Copy,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ApplicationStatus } from "@/generated/prisma";
import { AdminHeader } from "@/components/admin/admin-header";

function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // TanStack Query hooks
  const {
    data: application,
    isLoading,
    error,
    refetch,
  } = useAdminApplication(applicationId);
  const paymentMutation = usePaymentStatusMutation();
  const rejectionMutation = useApplicationRejectionMutation();
  const submissionMutation = useApplicationSubmissionMutation();

  // Copy functionality
  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Download image function using server-side API (recommended)
  const downloadImage = async (photoPath: string, filename: string) => {
    try {
      const response = await fetch("/api/photos/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: photoPath,
          filename: filename,
        }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert(
        `Failed to download image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Photo component with signed URL support
  const PhotoComponent = ({
    photoPath,
    title,
    size = "w-32 h-32",
  }: {
    photoPath: string | null | undefined;
    title: string;
    size?: string;
  }) => {
    const {
      data: signedUrlData,
      isLoading: isLoadingSignedUrl,
      error: signedUrlError,
    } = useSignedUrl(photoPath || undefined, !!photoPath);

    if (!photoPath) {
      return (
        <div className="flex items-center gap-3 text-gray-500">
          <div
            className={`${size} bg-gray-100 rounded-lg border flex items-center justify-center`}
          >
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm">No photo uploaded</p>
        </div>
      );
    }

    if (isLoadingSignedUrl) {
      return (
        <div className="flex items-start gap-4">
          <div
            className={`${size} bg-gray-100 rounded-lg border flex items-center justify-center`}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">Loading photo...</p>
            </div>
          </div>
        </div>
      );
    }

    if (
      signedUrlError ||
      !signedUrlData?.success ||
      !signedUrlData?.signedUrl
    ) {
      return (
        <div className="flex items-start gap-4">
          <div
            className={`${size} bg-gray-100 rounded-lg border flex items-center justify-center`}
          >
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-sm text-red-500">Failed to load photo</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={signedUrlData.signedUrl}
            alt={title}
            className={`${size} object-cover rounded-lg border`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div
            className={`hidden ${size} bg-gray-100 rounded-lg border flex items-center justify-center`}
          >
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">Photo uploaded</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadImage(
                  photoPath!,
                  `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`
                )
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(signedUrlData.signedUrl!, "_blank")}
            >
              <Camera className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Copyable field component
  const CopyableField = ({
    label,
    value,
    fieldId,
    className = "text-sm text-gray-900",
  }: {
    label: string;
    value: string | null | undefined;
    fieldId: string;
    className?: string;
  }) => {
    if (!value) return null;

    return (
      <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="flex items-center justify-between group">
          <p className={className}>{value}</p>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={() => copyToClipboard(value, fieldId)}
            title={`Copy ${label}`}
          >
            {copiedField === fieldId ? (
              <CheckCheck className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 text-gray-400" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Action handlers using mutations
  const handlePaymentAction = (action: "approve" | "reject") => {
    if (!application) return;
    paymentMutation.mutate({ applicationId: application.id, action });
  };

  const handleApplicationRejection = (rejectionNote: string) => {
    if (!application) return;
    rejectionMutation.mutate({ applicationId: application.id, rejectionNote });
  };

  const handleApplicationSubmission = (confirmationNumber: string) => {
    if (!application) return;
    submissionMutation.mutate({
      applicationId: application.id,
      confirmationNumber,
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return (
          <Badge variant="outline" className="flex w-fit items-center gap-1">
            <Clock className="h-3 w-3" />
            Payment Pending
          </Badge>
        );
      case "PAYMENT_VERIFIED":
        return (
          <Badge variant="default" className="flex w-fit items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Payment Verified
          </Badge>
        );
      case "PAYMENT_REJECTED":
        return (
          <Badge
            variant="destructive"
            className="flex w-fit items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Payment Rejected
          </Badge>
        );
      case "APPLICATION_REJECTED":
        return (
          <Badge
            variant="destructive"
            className="flex w-fit items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Application Rejected
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge
            variant="default"
            className="flex w-fit items-center gap-1 bg-blue-100 text-blue-800"
          >
            <Send className="h-3 w-3" />
            Submitted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatEducationLevel = (level: string) => {
    const educationLabels: Record<string, string> = {
      PRIMARY_SCHOOL_ONLY: "Primary school only",
      SOME_HIGH_SCHOOL_NO_DIPLOMA: "Some high school, no diploma",
      HIGH_SCHOOL_DIPLOMA: "High school diploma",
      VOCATIONAL_SCHOOL: "Vocational school",
      SOME_UNIVERSITY_COURSES: "Some university courses",
      UNIVERSITY_DEGREE: "University degree",
      SOME_GRADUATE_LEVEL_COURSES: "Some graduate-level courses",
      MASTER_DEGREE: "Master's degree",
      SOME_DOCTORAL_LEVEL_COURSES: "Some doctoral-level courses",
      DOCTORATE: "Doctorate",
    };
    return educationLabels[level] || level;
  };

  const formatMaritalStatus = (status: string) => {
    const maritalLabels: Record<string, string> = {
      UNMARRIED: "Unmarried",
      MARRIED_SPOUSE_NOT_US_CITIZEN_LPR:
        "Married — spouse is NOT a U.S. citizen or U.S. LPR",
      MARRIED_SPOUSE_IS_US_CITIZEN_LPR:
        "Married — spouse IS a U.S. citizen or U.S. LPR",
      DIVORCED: "Divorced",
      WIDOWED: "Widowed",
      LEGALLY_SEPARATED: "Legally separated",
    };
    return maritalLabels[status] || status;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Not available";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "Not available";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Application
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <div className="space-x-4">
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link
              href="/admin/applications"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested application could not be found.
          </p>
          <Link
            href="/admin/applications"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const canManagePayment =
    application.status === "PAYMENT_PENDING" && application.paymentReference;
  const canRejectApplication =
    application.status === "PAYMENT_VERIFIED" ||
    application.status === "PAYMENT_PENDING";
  const canSubmitApplication = application.status === "PAYMENT_VERIFIED";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader
        breadcrumbs={[
          { label: "Admin Panel", href: "/admin" },
          { label: "Application" },
        ]}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Application Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {canManagePayment && (
                    <>
                      <ApprovePaymentDialog
                        onApprove={() => handlePaymentAction("approve")}
                        isApproving={
                          paymentMutation.isPending &&
                          paymentMutation.variables?.action === "approve"
                        }
                        disabled={
                          paymentMutation.isPending ||
                          rejectionMutation.isPending ||
                          submissionMutation.isPending
                        }
                        paymentReference={
                          application.paymentReference || undefined
                        }
                      />
                      <RejectPaymentDialog
                        onReject={() => handlePaymentAction("reject")}
                        isRejecting={
                          paymentMutation.isPending &&
                          paymentMutation.variables?.action === "reject"
                        }
                        disabled={
                          paymentMutation.isPending ||
                          rejectionMutation.isPending ||
                          submissionMutation.isPending
                        }
                        paymentReference={
                          application.paymentReference || undefined
                        }
                      />
                    </>
                  )}
                  {canRejectApplication && (
                    <RejectApplicationDialog
                      onReject={handleApplicationRejection}
                      isRejecting={rejectionMutation.isPending}
                      disabled={
                        paymentMutation.isPending ||
                        rejectionMutation.isPending ||
                        submissionMutation.isPending
                      }
                    />
                  )}
                  {canSubmitApplication && (
                    <SubmitApplicationDialog
                      onSubmit={handleApplicationSubmission}
                      isSubmitting={submissionMutation.isPending}
                      disabled={
                        paymentMutation.isPending ||
                        rejectionMutation.isPending ||
                        submissionMutation.isPending
                      }
                      applicantName={`${application.givenName} ${application.familyName}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CopyableField
                      label="Given Name"
                      value={application.givenName}
                      fieldId="givenName"
                    />
                    <CopyableField
                      label="Family Name"
                      value={application.familyName}
                      fieldId="familyName"
                    />
                    <CopyableField
                      label="Middle Name"
                      value={application.middleName}
                      fieldId="middleName"
                    />
                    <CopyableField
                      label="Gender"
                      value={application.gender}
                      fieldId="gender"
                    />
                    <CopyableField
                      label="Date of Birth"
                      value={formatDate(application.dateOfBirth)}
                      fieldId="dateOfBirth"
                    />
                    <CopyableField
                      label="City of Birth"
                      value={application.cityOfBirth}
                      fieldId="cityOfBirth"
                    />
                    <CopyableField
                      label="Country of Birth"
                      value={application.countryOfBirth}
                      fieldId="countryOfBirth"
                    />
                    <CopyableField
                      label="Country of Eligibility"
                      value={application.countryOfEligibility}
                      fieldId="countryOfEligibility"
                    />
                    <CopyableField
                      label="Eligibility Claim Type"
                      value={application.eligibilityClaimType}
                      fieldId="eligibilityClaimType"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CopyableField
                      label="Email"
                      value={application.email}
                      fieldId="email"
                    />
                    <CopyableField
                      label="Phone Number"
                      value={application.phoneNumber}
                      fieldId="phoneNumber"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Mailing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <CopyableField
                      label="In Care Of"
                      value={application.inCareOf}
                      fieldId="inCareOf"
                    />
                    <CopyableField
                      label="Address Line 1"
                      value={application.addressLine1}
                      fieldId="addressLine1"
                    />
                    <CopyableField
                      label="Address Line 2"
                      value={application.addressLine2}
                      fieldId="addressLine2"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <CopyableField
                        label="City"
                        value={application.city}
                        fieldId="city"
                      />
                      <CopyableField
                        label="State/Province"
                        value={application.stateProvince}
                        fieldId="stateProvince"
                      />
                      <CopyableField
                        label="Postal Code"
                        value={application.postalCode}
                        fieldId="postalCode"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CopyableField
                        label="Country"
                        value={application.country}
                        fieldId="country"
                      />
                      <CopyableField
                        label="Country of Residence"
                        value={application.countryOfResidence}
                        fieldId="countryOfResidence"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CopyableField
                    label="Highest Education Level"
                    value={formatEducationLevel(application.educationLevel)}
                    fieldId="educationLevel"
                  />
                </CardContent>
              </Card>

              {/* Marital Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Marital Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CopyableField
                    label="Marital Status"
                    value={formatMaritalStatus(application.maritalStatus)}
                    fieldId="maritalStatus"
                  />

                  {application.maritalStatus ===
                    "MARRIED_SPOUSE_NOT_US_CITIZEN_LPR" && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Spouse Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CopyableField
                          label="Spouse Given Name"
                          value={application.spouseGivenName}
                          fieldId="spouseGivenName"
                        />
                        <CopyableField
                          label="Spouse Family Name"
                          value={application.spouseFamilyName}
                          fieldId="spouseFamilyName"
                        />
                        <CopyableField
                          label="Spouse Middle Name"
                          value={application.spouseMiddleName}
                          fieldId="spouseMiddleName"
                        />
                        <CopyableField
                          label="Spouse Gender"
                          value={application.spouseGender}
                          fieldId="spouseGender"
                        />
                        <CopyableField
                          label="Spouse Date of Birth"
                          value={
                            application.spouseDateOfBirth
                              ? formatDate(application.spouseDateOfBirth)
                              : null
                          }
                          fieldId="spouseDateOfBirth"
                        />
                        <CopyableField
                          label="Spouse City of Birth"
                          value={application.spouseCityOfBirth}
                          fieldId="spouseCityOfBirth"
                        />
                        <CopyableField
                          label="Spouse Country of Birth"
                          value={application.spouseCountryOfBirth}
                          fieldId="spouseCountryOfBirth"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Children */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Children ({application.children?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.children && application.children.length > 0 ? (
                    <div className="space-y-4">
                      {application.children.map((child, index) => (
                        <div
                          key={child.id || index}
                          className="border rounded-lg p-4"
                        >
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Child {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CopyableField
                              label="Given Name"
                              value={child.givenName}
                              fieldId={`child-${index}-givenName`}
                            />
                            <CopyableField
                              label="Family Name"
                              value={child.familyName}
                              fieldId={`child-${index}-familyName`}
                            />
                            <CopyableField
                              label="Middle Name"
                              value={child.middleName}
                              fieldId={`child-${index}-middleName`}
                            />
                            <CopyableField
                              label="Gender"
                              value={child.gender}
                              fieldId={`child-${index}-gender`}
                            />
                            <CopyableField
                              label="Date of Birth"
                              value={formatDate(child.dateOfBirth)}
                              fieldId={`child-${index}-dateOfBirth`}
                            />
                            <CopyableField
                              label="City of Birth"
                              value={child.cityOfBirth}
                              fieldId={`child-${index}-cityOfBirth`}
                            />
                            <CopyableField
                              label="Country of Birth"
                              value={child.countryOfBirth}
                              fieldId={`child-${index}-countryOfBirth`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Baby className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No children listed</p>
                      <p className="text-xs text-gray-400 mt-1">
                        This applicant has not listed any children under 21
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Applicant Photo */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-3 block">
                      Main Applicant Photo
                    </label>
                    <PhotoComponent
                      photoPath={application.photoUrl}
                      title={`${application.givenName} ${application.familyName}`}
                    />
                  </div>

                  {/* Spouse Photo */}
                  {application.maritalStatus ===
                    "MARRIED_SPOUSE_NOT_US_CITIZEN_LPR" && (
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-gray-500 mb-3 block">
                        Spouse Photo
                      </label>
                      <PhotoComponent
                        photoPath={application.spousePhotoUrl}
                        title={`${application.spouseGivenName || "Spouse"} ${
                          application.spouseFamilyName || ""
                        }`.trim()}
                      />
                    </div>
                  )}

                  {/* Children Photos */}
                  {application.children && application.children.length > 0 && (
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-gray-500 mb-3 block">
                        Children Photos
                      </label>
                      <div className="space-y-6">
                        {application.children.map((child, index) => (
                          <div key={index}>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Child {index + 1}
                            </h5>
                            <PhotoComponent
                              photoPath={child.photoUrl}
                              title={`${child.givenName} ${child.familyName}`}
                              size="w-24 h-24"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image
                      src="https://rqneahjmfgavjopmosda.supabase.co/storage/v1/object/public/dv-photos/dvsubmit-logo.webp"
                      alt="DVSubmit Logo"
                      width={48}
                      height={48}
                      className="sm:h-12 h-10 w-10 sm:w-12"
                    />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Current Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(application.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(application.updatedAt)}
                    </p>
                  </div>

                  {application.submittedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Submitted At
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(application.submittedAt)}
                      </p>
                    </div>
                  )}

                  {application.confirmationNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        DV Confirmation Number
                      </label>
                      <p className="text-sm font-mono text-green-600">
                        {application.confirmationNumber}
                      </p>
                    </div>
                  )}

                  {application.submittedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Submitted By
                      </label>
                      <p className="text-sm text-gray-900">
                        {application.submittedBy}
                      </p>
                    </div>
                  )}

                  {application.status === "APPLICATION_REJECTED" && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Rejection Note
                      </label>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          {application.rejectionNote}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.paymentReference ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Payment Reference
                        </label>
                        <p className="text-sm font-mono text-gray-900">
                          {application.paymentReference}
                        </p>
                      </div>

                      {application.paymentVerifiedAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Payment Verified At
                          </label>
                          <p className="text-sm text-gray-900">
                            {formatDateTime(application.paymentVerifiedAt)}
                          </p>
                        </div>
                      )}

                      {application.paymentVerifiedBy && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Verified By
                          </label>
                          <p className="text-sm text-gray-900">
                            {application.paymentVerifiedBy}
                          </p>
                        </div>
                      )}

                      {application.status !== "SUBMITTED" && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Payment Status
                          </label>
                          <div className="mt-1">
                            {application.status === "PAYMENT_VERIFIED" ? (
                              <Badge
                                variant="default"
                                className="flex w-fit items-center gap-1 bg-green-100 text-green-800"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            ) : application.status === "PAYMENT_REJECTED" ? (
                              <Badge
                                variant="destructive"
                                className="flex w-fit items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Rejected
                              </Badge>
                            ) : (
                              application.status === "PAYMENT_PENDING" && (
                                <Badge
                                  variant="outline"
                                  className="flex w-fit items-center gap-1 text-orange-600 border-orange-200"
                                >
                                  <Clock className="h-3 w-3" />
                                  Pending Verification
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No payment submitted yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applicant needs to submit payment reference
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Photo Validation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Photo Validation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Main Photo Status
                    </label>
                    <div className="mt-1">
                      {application.photoUrl ? (
                        application.photoValidated ? (
                          <Badge
                            variant="default"
                            className="flex items-center w-fit gap-1 bg-green-100 text-green-800"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Validated
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center w-fit gap-1 text-orange-600 border-orange-200"
                          >
                            <Clock className="h-3 w-3" />
                            Pending Validation
                          </Badge>
                        )
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex items-center w-fit gap-1 text-gray-500"
                        >
                          <XCircle className="h-3 w-3" />
                          No Photo
                        </Badge>
                      )}
                    </div>
                  </div>

                  {application.children && application.children.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Children Photos
                      </label>
                      <div className="mt-2 space-y-1">
                        {application.children.map((child, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-600">
                              {child.givenName} {child.familyName}
                            </span>
                            {child.photoUrl ? (
                              <Badge
                                variant="outline"
                                className="text-xs  w-fit h-5 px-2"
                              >
                                <CheckCircle className="h-2 w-2 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs w-fit h-5 px-2 text-gray-500"
                              >
                                <XCircle className="h-2 w-2 mr-1" />
                                Missing
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.maritalStatus ===
                    "MARRIED_SPOUSE_NOT_US_CITIZEN_LPR" && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Spouse Photo
                      </label>
                      <div className="mt-1">
                        {application.spousePhotoUrl ? (
                          <Badge
                            variant="outline"
                            className="flex w-fit items-center gap-1 text-green-600"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex  w-fit items-center gap-1 text-gray-500"
                          >
                            <XCircle className="h-3 w-3" />
                            Missing
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {application.user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p className="text-sm font-mono text-gray-900">
                      {application.user.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Created
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(application.user.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(ApplicationDetailPage, { requireAdmin: true });
