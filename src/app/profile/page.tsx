'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, userWithRole, loading } = useAuth()

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
        <div className="mb-8">
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
          <div className='pt-6'> 
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="h-8 w-8" />
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
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
                </div>

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
                <div className="flex items-center justify-between p-4 border rounded-lg">
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



          <Card>
            <CardHeader >
            </CardHeader>
            <CardContent>
              <div className="space-y-4">


                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-600">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Delete Account
                    <span className="text-xs ml-2">(Coming Soon)</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}