'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApplicationRecord } from '@/lib/types/application'
import { StatusBadge } from './status-badge'
import { Clock, XCircle, CreditCard, Edit, Copy, Printer } from 'lucide-react'

interface ApplicationCardProps {
    application: ApplicationRecord
    onUpdatePayment?: (application: ApplicationRecord) => void
    onEditApplication?: (applicationId: string) => void
    onCopyConfirmation?: (confirmationNumber: string) => void
    onPrintProof?: (applicationId: string, confirmationNumber: string, fullName: string, dateOfBirth: Date) => void
    isPrinting?: boolean
    variant?: 'pending' | 'submitted'
}

export function ApplicationCard({
    application,
    onUpdatePayment,
    onEditApplication,
    onCopyConfirmation,
    onPrintProof,
    isPrinting = false,
    variant = 'pending'
}: ApplicationCardProps) {
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const fullName = `${application.givenName} ${application.middleName || ''} ${application.familyName}`.trim()
    const initials = `${application.givenName.charAt(0)}${application.familyName.charAt(0)}`

    const cardClassName = variant === 'pending'
        ? "border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow"
        : "bg-green-50/50"

    const avatarClassName = variant === 'pending'
        ? "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
        : "w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"

    return (
        <Card className={cardClassName}>
            <CardContent className="p-4 sm:p-6">
                {/* Header with name and status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={avatarClassName}>
                                {initials}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                {fullName}
                            </h3>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <StatusBadge status={application.status} />
                    </div>
                </div>

                {/* Confirmation Number for submitted applications */}
                {variant === 'submitted' && application.confirmationNumber && (
                    <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                                    DV Confirmation Number
                                </div>
                                <div className="font-mono text-lg font-bold text-green-800 select-all break-all">
                                    {application.confirmationNumber}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCopyConfirmation?.(application.confirmationNumber!)}
                                className="ml-3 text-green-600 hover:text-green-700 hover:bg-green-100"
                                title="Copy confirmation number"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Application Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    {variant === 'pending' && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment Reference</div>
                            <div className="text-sm font-mono text-gray-900 truncate">
                                {application.paymentReference || 'Not provided'}
                            </div>
                        </div>
                    )}
                    <div className={variant === 'pending' ? "bg-gray-50 rounded-lg p-3" : "bg-white rounded-lg p-3 border border-gray-200"}>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date of Birth</div>
                        <div className="text-sm text-gray-900 font-mono">
                            {new Date(application.dateOfBirth).toISOString().split('T')[0]}
                        </div>
                    </div>
                    {variant === 'submitted' && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted Date</div>
                            <div className="text-sm text-gray-900">
                                {application.submittedAt ? formatDate(application.submittedAt) : 'N/A'}
                            </div>
                        </div>
                    )}
                    <div className={variant === 'pending'
                        ? "bg-gray-50 rounded-lg p-3 sm:col-span-2 lg:col-span-1"
                        : "bg-white rounded-lg p-3 border border-gray-200 sm:col-span-2 lg:col-span-1"
                    }>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {variant === 'submitted' ? 'Application Created' : 'Created'}
                        </div>
                        <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                    </div>
                </div>

                {/* Rejection Note */}
                {application.status === 'APPLICATION_REJECTED' && application.rejectionNote && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                                <p className="text-sm text-red-700 leading-relaxed mb-2">{application.rejectionNote}</p>
                                <p className="text-xs text-red-600 italic">
                                    Please review the feedback above and edit your application to address the issues mentioned.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className={variant === 'pending' ? "flex flex-col sm:flex-row gap-2 sm:gap-3" : "flex gap-2 sm:gap-3 justify-end"}>
                    {application.status === 'PAYMENT_REJECTED' && onUpdatePayment && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdatePayment(application)}
                            className="flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <CreditCard className="h-4 w-4" />
                            Update Payment Reference
                        </Button>
                    )}
                    {application.status === 'APPLICATION_REJECTED' && onEditApplication && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditApplication(application.id)}
                            className="flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Application
                        </Button>
                    )}
                    {(application.status === 'PAYMENT_PENDING' || application.status === 'PAYMENT_VERIFIED') && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 italic py-2">
                            <Clock className="h-4 w-4" />
                            Processing...
                        </div>
                    )}
                    {variant === 'submitted' && application.confirmationNumber && onPrintProof && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPrintProof(
                                application.id,
                                application.confirmationNumber!,
                                fullName,
                                application.dateOfBirth
                            )}
                            disabled={isPrinting}
                            className="flex items-center text-sm justify-center gap-2 text-sm font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                            <Printer className="h-4 w-4" />
                            {isPrinting ? 'Opening Print...' : 'Print Proof'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}