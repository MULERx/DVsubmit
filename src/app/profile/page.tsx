'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useDeleteAccountMutation } from '@/hooks/use-auth-mutations'

export default function ProfilePage() {
  const { user, userWithRole, loading } = useAuth()
  const deleteAccountMutation = useDeleteAccountMutation()

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      USER: { variant: 'secondary' as const, label: 'User' },
      ADMIN: { variant: 'default' as const, label: 'Admin' },
      SUPER_ADMIN: { variant: 'destructive' as const, label: 'Super Admin' },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div className='mt-3 sm:pt-6'>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="h-8 w-8" />
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <div className="sm:space-y-6 space-y-4">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your basic account details and authentication information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This is your login email and cannot be changed
                  </p>
                </div>

                {userWithRole?.role && userWithRole.role !== 'USER' && <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Account Role
                  </label>
                  <div className="mt-1">
                    {getRoleBadge(userWithRole?.role || 'USER')}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your access level in the system
                  </p>
                </div>}

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Account Created
                  </label>
                  <p className="text-gray-900 mt-1">
                    {userWithRole?.dbUser?.createdAt
                      ? formatDate(userWithRole.dbUser.createdAt)
                      : 'N/A'
                    }
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Account ID
                  </label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">
                    {userWithRole?.dbUser?.id || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2  justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">
                      Change your account password
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Change Password
                    <span className="text-xs ml-2">(Coming Soon)</span>
                  </Button>
                </div>


              </div>
            </CardContent>
          </Card>



          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2  justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">
                      This will deactivate your account and remove access to all your data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className='cursor-pointer' disabled={deleteAccountMutation.isPending}>
                        {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div>
                            <p>
                              This action cannot be undone. This will permanently deactivate your account
                              and remove your access to all applications and data associated with your account.
                            </p>
                            <p className="mt-4">
                              <strong>Your account will be:</strong>
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Immediately deactivated</li>
                              <li>Removed from all applications</li>
                              <li>Unable to sign in again</li>
                            </ul>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className='cursor-pointer' disabled={deleteAccountMutation.isPending}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700 cursor-pointer"
                          disabled={deleteAccountMutation.isPending}
                        >
                          {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, delete my account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}