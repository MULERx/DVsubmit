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
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseUser: result.data.user,
          }),
        })

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json()
          
          // If account is deleted, sign out the user and return error
          if (syncResponse.status === 403 && errorData.error?.includes('deleted')) {
            await supabase.auth.signOut()
            return {
              data: { user: null, session: null },
              error: { message: errorData.error }
            }
          }
          
          throw new Error(errorData.error || 'Failed to sync user')
        }
      } catch (error) {
        console.error('Failed to sync user to database:', error)
        
        // If it's a deleted account error, pass it through
        if (error instanceof Error && error.message.includes('deleted')) {
          return {
            data: { user: null, session: null },
            error: { message: error.message }
          }
        }
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

  // Reset password - Step 1: Send reset email
  // Following official Supabase docs: https://supabase.com/docs/guides/auth/passwords
  async resetPassword(email: string) {
    const supabase = createClient()
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    
    console.log('🔧 Sending password reset email with redirect URL:', redirectUrl)
    
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
  },

  // Get session from URL (for handling auth callbacks)
  async getSessionFromUrl() {
    const supabase = createClient()
    return await supabase.auth.getSession()
  },

  // Update password
  async updatePassword(password: string) {
    const supabase = createClient()
    return await supabase.auth.updateUser({ password })
  },

  // Resend confirmation email
  async resendConfirmation(email: string) {
    const supabase = createClient()
    return await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  },

  // Set session with tokens (for password reset)
  async setSession(accessToken: string, refreshToken: string) {
    const supabase = createClient()
    return await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  },

  // Handle password reset token using the session approach
  async handleResetToken(token: string) {
    const supabase = createClient()
    
    // Try to get the current session first
    const { data: currentSession } = await supabase.auth.getSession()
    
    if (currentSession?.session) {
      // If we already have a session, we're good
      return { data: currentSession, error: null }
    }
    
    // If no session, the token might be a refresh token or access token
    // Let's try to set it as a session directly
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token
      })
      
      if (error) {
        // If that doesn't work, try the exchange approach
        console.log('Direct session set failed, trying refresh...')
        const refreshResult = await supabase.auth.refreshSession({
          refresh_token: token
        })
        return refreshResult
      }
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
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
        return 'Please check your email and click the confirmation link to verify your account'
      case 'User already registered':
        return 'An account with this email already exists'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      case 'Invalid refresh token':
      case 'refresh_token_not_found':
        return 'Your session has expired. Please request a new password reset link.'
      case 'Token has expired':
      case 'invalid_token':
        return 'The password reset link has expired. Please request a new one.'
      case 'User not found':
        return 'No account found with this email address'
      case 'New password should be different from the old password':
        return 'Your new password must be different from your current password'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      case 'Account has been deleted and cannot be restored':
        return 'This account has been deleted and cannot be restored. Please contact support if you believe this is an error.'
      case 'For security purposes, you can only request this once every 60 seconds':
        return 'Please wait 60 seconds before requesting another confirmation email.'
      case 'Email rate limit exceeded':
        return 'Too many email requests. Please wait a few minutes before trying again.'
      default:
        // Check if message contains "deleted" for partial matches
        if (errorObj.message?.includes('deleted')) {
          return 'This account has been deleted and cannot be restored. Please contact support if you believe this is an error.'
        }
        // Check for rate limiting messages
        if (errorObj.message?.includes('rate limit') || errorObj.message?.includes('60 seconds')) {
          return 'Please wait before requesting another confirmation email.'
        }
        return errorObj.message || 'Authentication failed'
    }
  },
}