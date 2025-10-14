import { createClient } from '../supabase/server'
import { prisma } from '../db'
import { $Enums } from '@/generated/prisma'

type UserRole = $Enums.UserRole

// Server-side auth helpers (only use in server components, API routes, etc.)
export const authServer = {
  // Get user on server
  async getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get session on server
  async getSession() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Get user with database role information
  async getUserWithRole() {
    const supabaseUser = await this.getUser()
    if (!supabaseUser) return null

    const dbUser = await prisma.user.findUnique({
      where: { 
        supabaseId: supabaseUser.id,
        deletedAt: null 
      },
      select: {
        id: true,
        email: true,
        role: true,
        blocked: true,
        blockedAt: true,
        blockedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      supabaseUser,
      dbUser,
    }
  },

  // Get current user (alias for getUser for consistency)
  async getCurrentUser() {
    return await this.getUser()
  },

  // Create or update user in database after Supabase auth
  async syncUserToDatabase(supabaseUser: { id: string; email: string }) {
    try {
      // First check if user exists by supabaseId (including soft-deleted)
      const existingUserBySupabaseId = await prisma.user.findUnique({
        where: { 
          supabaseId: supabaseUser.id
        },
      })

      if (existingUserBySupabaseId) {
        // If user is soft-deleted, prevent login
        if (existingUserBySupabaseId.deletedAt) {
          throw new Error('Account has been deleted and cannot be restored')
        }

        // Update existing user if email changed
        if (existingUserBySupabaseId.email !== supabaseUser.email) {
          const updatedUser = await prisma.user.update({
            where: { supabaseId: supabaseUser.id },
            data: { email: supabaseUser.email },
          })

          // Also update the role in Supabase user metadata for faster access
          await this.updateSupabaseUserMetadata(supabaseUser.id, { role: updatedUser.role })

          return updatedUser
        }

        // Ensure role is synced to Supabase metadata
        await this.updateSupabaseUserMetadata(supabaseUser.id, { role: existingUserBySupabaseId.role })

        return existingUserBySupabaseId
      }

      // Check if user exists by email (in case of account linking or re-registration, exclude soft-deleted)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { 
          email: supabaseUser.email,
          deletedAt: null
        },
      })

      if (existingUserByEmail) {
        // Update the existing user with the new supabaseId
        const updatedUser = await prisma.user.update({
          where: { email: supabaseUser.email },
          data: { supabaseId: supabaseUser.id },
        })

        // Set role in Supabase user metadata
        await this.updateSupabaseUserMetadata(supabaseUser.id, { role: updatedUser.role })

        return updatedUser
      }

      // Create new user if no existing user found
      const newUser = await prisma.user.create({
        data: {
          email: supabaseUser.email,
          supabaseId: supabaseUser.id,
          role: 'USER', // Default role
        },
      })

      // Set role in Supabase user metadata
      await this.updateSupabaseUserMetadata(supabaseUser.id, { role: newUser.role })

      return newUser
    } catch (error) {
      
      // If it's still a unique constraint error, try to find and return the existing user
      if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { supabaseId: supabaseUser.id },
          })
          if (existingUser) {
            // If user is soft-deleted, prevent login
            if (existingUser.deletedAt) {
              throw new Error('Account has been deleted and cannot be restored')
            }
            return existingUser
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError)
        }
      }
      
      throw error
    }
  },

  // Update Supabase user metadata (for faster role access)
  async updateSupabaseUserMetadata(userId: string, metadata: Record<string, unknown>) {
    try {
      const { createServiceClient } = await import('../supabase/server')
      const supabase = createServiceClient()
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
      })
    } catch (error) {
      console.error('Error updating Supabase user metadata:', error)
      // Don't throw here as this is not critical
    }
  },

  // Check if user is authenticated (server-side)
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser()
    return !!user
  },

  // Check if user has specific role (server-side) - uses database role
  async hasRole(role: UserRole): Promise<boolean> {
    const userWithRole = await this.getUserWithRole()
    if (!userWithRole?.dbUser) return false
    return userWithRole.dbUser.role === role
  },

  // Check if user is admin (server-side)
  async isAdmin(): Promise<boolean> {
    return await this.hasRole('ADMIN') || await this.hasRole('SUPER_ADMIN')
  },

  // Check if user is super admin (server-side)
  async isSuperAdmin(): Promise<boolean> {
    return await this.hasRole('SUPER_ADMIN')
  },

  // Get user role (server-side) - from database
  async getUserRole(): Promise<UserRole | null> {
    const userWithRole = await this.getUserWithRole()
    return userWithRole?.dbUser?.role || null
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      // Check if current user is admin
      const isCurrentUserAdmin = await this.isAdmin()
      if (!isCurrentUserAdmin) {
        throw new Error('Unauthorized: Only admins can update user roles')
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      })

      // Also update the role in Supabase user metadata
      await this.updateSupabaseUserMetadata(updatedUser.supabaseId, { role: newRole })

      return true
    } catch (error) {
      console.error('Error updating user role:', error)
      return false
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    const isCurrentUserAdmin = await this.isAdmin()
    if (!isCurrentUserAdmin) {
      throw new Error('Unauthorized: Only admins can view all users')
    }

    return await prisma.user.findMany({
      where: {
        deletedAt: null // Exclude soft-deleted users
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Sign out user
  async signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
  },
}