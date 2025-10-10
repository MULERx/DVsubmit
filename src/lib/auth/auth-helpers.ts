import { createClient } from '../supabase/client'
import { User } from '@supabase/supabase-js'

// Client-side auth helpers
export const authClient = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const supabase = createClient()
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    // If signup successful, sync user to database
    if (result.data.user && !result.error) {
      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseUser: result.data.user,
          }),
        })
      } catch (error) {
        console.error('Failed to sync user to database:', error)
      }
    }

    return result
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const supabase = createClient()
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If signin successful, ensure user is synced to database
    if (result.data.user && !result.error) {
      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseUser: result.data.user,
          }),
        })
      } catch (error) {
        console.error('Failed to sync user to database:', error)
      }
    }

    return result
  },

  // Sign in with Google
  async signInWithGoogle() {
    const supabase = createClient()
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    return await supabase.auth.signOut()
  },

  // Get current user
  async getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get current session
  async getSession() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Get user with database role information
  async getUserWithRole() {
    try {
      const response = await fetch('/api/auth/user-role')
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Failed to get user role:', error)
      return null
    }
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = createClient()
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })
  },

  // Update password
  async updatePassword(password: string) {
    const supabase = createClient()
    return await supabase.auth.updateUser({ password })
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient()
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  },
}

// Note: Server-side auth helpers are in separate files to avoid importing next/headers in client components

// Auth validation helpers
export const authValidation = {
  // Check if user is authenticated
  isAuthenticated(user: User | null): boolean {
    return !!user
  },

  // Check if user has specific role (fallback to metadata if database role not available)
  hasRole(user: User | null, role: string, dbRole?: string): boolean {
    if (!user) return false
    
    // Prefer database role if available
    if (dbRole) {
      return dbRole === role
    }
    
    // Fallback to Supabase metadata
    return user.user_metadata?.role === role || user.app_metadata?.role === role
  },

  // Check if user is admin
  isAdmin(user: User | null, dbRole?: string): boolean {
    return this.hasRole(user, 'ADMIN', dbRole) || this.hasRole(user, 'SUPER_ADMIN', dbRole)
  },

  // Check if user is super admin
  isSuperAdmin(user: User | null, dbRole?: string): boolean {
    return this.hasRole(user, 'SUPER_ADMIN', dbRole)
  },

  // Get user role (prefer database role)
  getUserRole(user: User | null, dbRole?: string): string | null {
    if (!user) return null
    
    // Prefer database role if available
    if (dbRole) {
      return dbRole
    }
    
    // Fallback to Supabase metadata
    return user.user_metadata?.role || user.app_metadata?.role || 'USER'
  },
}

// Auth error handling
export const authErrors = {
  getErrorMessage(error: unknown): string {
    if (!error) return 'An unknown error occurred'
    
    const errorObj = error as { message?: string }
    
    // Supabase auth error messages
    switch (errorObj.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link'
      case 'User already registered':
        return 'An account with this email already exists'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      default:
        return errorObj.message || 'Authentication failed'
    }
  },
}