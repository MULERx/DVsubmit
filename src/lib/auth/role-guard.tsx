'use client'

import React from 'react'
import { useAuth } from './auth-context'

interface RoleGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireSuperAdmin?: boolean
  fallback?: React.ReactNode
}

export function RoleGuard({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false, 
  fallback = null 
}: RoleGuardProps) {
  const { isAdmin, isSuperAdmin, loading, userWithRole, user } = useAuth()

  // Show loading while auth is being determined
  if (loading || (user && !userWithRole)) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <>{fallback}</>
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requireAdmin fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function SuperAdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requireSuperAdmin fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

// Hook for role-based logic
export function useRoleCheck() {
  const { isAdmin, isSuperAdmin, userRole, userWithRole } = useAuth()

  return {
    isAdmin,
    isSuperAdmin,
    userRole,
    hasRole: (role: string) => userWithRole?.role === role,
    canAccess: (requiredRole: 'ADMIN' | 'SUPER_ADMIN') => {
      if (requiredRole === 'SUPER_ADMIN') return isSuperAdmin
      if (requiredRole === 'ADMIN') return isAdmin
      return false
    },
  }
}