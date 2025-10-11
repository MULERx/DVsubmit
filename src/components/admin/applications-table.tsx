'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { AdminApplication } from '@/hooks/use-admin-applications'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  CreditCard,
  MoreVertical,
  Check,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePaymentActions } from '@/hooks/use-payment-actions'

interface ApplicationsTableProps {
  applications: AdminApplication[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function ApplicationsTable({
  applications,
  pagination,
  onPageChange,
  isLoading = false
}: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: 'approve' | 'reject' | null
    application: AdminApplication | null
  }>({
    isOpen: false,
    action: null,
    application: null
  })

  const paymentActions = usePaymentActions()

  const handlePaymentAction = (action: 'approve' | 'reject', application: AdminApplication) => {
    paymentActions.mutate(
      { applicationId: application.id, action },
      {
        onSettled: () => {
          setConfirmDialog({ isOpen: false, action: null, application: null })
        }
      }
    )
  }

  const openConfirmDialog = (action: 'approve' | 'reject', application: AdminApplication) => {
    setConfirmDialog({
      isOpen: true,
      action,
      application
    })
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Payment Pending
          </Badge>
        )
      case 'PAYMENT_VERIFIED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Payment Verified
          </Badge>
        )
      case 'SUBMITTED':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800">
            <Send className="h-3 w-3" />
            Submitted
          </Badge>
        )
      case 'CONFIRMED':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (paymentStatus: string, paymentReference?: string) => {
    switch (paymentStatus) {
      case 'PENDING':
        if (!paymentReference) {
          return (
            <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-200">
              <Clock className="h-3 w-3" />
              No Payment Submitted
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-200">
            <CreditCard className="h-3 w-3" />
            Pending Verification
          </Badge>
        )
      case 'VERIFIED':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>
    }
  }

  const columns: ColumnDef<AdminApplication>[] = [
    {
      accessorKey: 'applicant',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Applicant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const app = row.original
        const fullName = `${app.givenName || ''} ${app.familyName || ''}`.trim()
        const displayName = fullName || 'Name not provided'

        return (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {app.givenName?.charAt(0) || app.user.email.charAt(0).toUpperCase()}
                {app.familyName?.charAt(0) || ''}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{displayName}</div>
              <div className="text-sm text-gray-500">{app.user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Application Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
      cell: ({ row }) => getPaymentStatusBadge(row.original.paymentStatus, row.original.paymentReference),
    },
    {
      accessorKey: 'paymentReference',
      header: 'Payment Reference',
      cell: ({ row }) => {
        const ref = row.original.paymentReference
        const paymentStatus = row.original.paymentStatus

        if (ref) {
          return <span className="font-mono text-sm">{ref}</span>
        } else if (paymentStatus === 'PENDING') {
          return (
            <span className="text-orange-500 text-sm italic">
              Awaiting payment submission
            </span>
          )
        } else {
          return <span className="text-gray-400">-</span>
        }
      },
    },
    {
      accessorKey: 'confirmationNumber',
      header: 'DV Confirmation',
      cell: ({ row }) => {
        const confirmation = row.original.confirmationNumber
        return confirmation ? (
          <span className="font-mono text-sm text-green-600">{confirmation}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const app = row.original
        const canManagePayment = app.paymentStatus === 'PENDING' 

        return (
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/applications/${app.id}`}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Link>

            {canManagePayment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={paymentActions.isPending}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => openConfirmDialog('approve', app)}
                    className="text-green-600 focus:text-green-600"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Payment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => openConfirmDialog('reject', app)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Payment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
    pageCount: pagination.totalPages,
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No applications found</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={pagination.page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) =>
        setConfirmDialog({ isOpen: open, action: null, application: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'approve' ? (
                <>
                  Are you sure you want to approve the payment for{' '}
                  <strong>
                    {confirmDialog.application?.givenName} {confirmDialog.application?.familyName}
                  </strong>
                  ?
                  <br />
                  <br />
                  Payment Reference: <code className="bg-gray-100 px-1 rounded">
                    {confirmDialog.application?.paymentReference}
                  </code>
                  <br />
                  <br />
                  This will mark the payment as verified and allow the application to proceed to DV submission.
                </>
              ) : (
                <>
                  Are you sure you want to reject the payment for{' '}
                  <strong>
                    {confirmDialog.application?.givenName} {confirmDialog.application?.familyName}
                  </strong>
                  ?
                  <br />
                  <br />
                  Payment Reference: <code className="bg-gray-100 px-1 rounded">
                    {confirmDialog.application?.paymentReference}
                  </code>
                  <br />
                  <br />
                  This will mark the payment as rejected and the applicant will need to resubmit their payment.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.action && confirmDialog.application) {
                  handlePaymentAction(confirmDialog.action, confirmDialog.application)
                }
              }}
              className={
                confirmDialog.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
              disabled={paymentActions.isPending}
            >
              {paymentActions.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                confirmDialog.action === 'approve' ? 'Approve Payment' : 'Reject Payment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}