'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { authClient, authValidation } from './auth-helpers'

interface UserWithRole {
  supabaseUser: User
  dbUser: {
    id: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
  } | null
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  role: string
}

interface AuthContextType {
  user: User | null
  userWithRole: UserWithRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signUp: (email: string, password: string) => Promise<unknown>
  signInWithGoogle: () => Promise<unknown>
  signOut: () => Promise<unknown>
  resetPassword: (email: string) => Promise<unknown>
  updatePassword: (password: string) => Promise<unknown>
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  userRole: string | null
  refreshUserRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserRole = async () => {
    if (user) {
      try {
        const roleData = await authClient.getUserWithRole()
        setUserWithRole(roleData)
      } catch (error) {
        console.error('Failed to refresh user role:', error)
      }
    }
  }

  useEffect(() => {
    // Get initial session
    authClient.getSession().then(async (session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        try {
          const roleData = await authClient.getUserWithRole()
          setUserWithRole(roleData)
        } catch (error) {
          console.error('Failed to get user role:', error)
        }
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authClient.onAuthStateChange(async (user) => {
      setUser(user)
      
      if (user) {
        try {
          const roleData = await authClient.getUserWithRole()
          setUserWithRole(roleData)
        } catch (error) {
          console.error('Failed to get user role:', error)
          setUserWithRole(null)
        }
      } else {
        setUserWithRole(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    userWithRole,
    loading,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signInWithGoogle: authClient.signInWithGoogle,
    signOut: authClient.signOut,
    resetPassword: authClient.resetPassword,
    updatePassword: authClient.updatePassword,
    isAuthenticated: authValidation.isAuthenticated(user),
    isAdmin: authValidation.isAdmin(user, userWithRole?.role),
    isSuperAdmin: authValidation.isSuperAdmin(user, userWithRole?.role),
    userRole: authValidation.getUserRole(user, userWithRole?.role),
    refreshUserRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAdmin?: boolean
    requireSuperAdmin?: boolean
    redirectTo?: string
  }
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, isAdmin, isSuperAdmin, userWithRole } = useAuth()
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
      if (loading) return

      if (!user) {
        window.location.href = options?.redirectTo || '/login'
        return
      }

      // Wait for role data to be loaded if user exists
      if (user && !userWithRole) {
        return
      }

      if (options?.requireSuperAdmin && !isSuperAdmin) {
        window.location.href = '/unauthorized'
        return
      }

      if (options?.requireAdmin && !isAdmin) {
        window.location.href = '/unauthorized'
        return
      }

      setShouldRender(true)
    }, [user, loading, isAdmin, isSuperAdmin, userWithRole])

    if (loading || (user && !userWithRole)) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }

    if (!shouldRender) {
      return null
    }

    return <Component {...props} />
  }
}