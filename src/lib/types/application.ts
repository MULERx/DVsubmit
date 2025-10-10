import { z } from 'zod'
import {
  personalInfoSchema,
  contactInfoSchema,
  educationWorkSchema,
  photoSchema,
  paymentSchema,
  applicationSchema,
  registerSchema,
  loginSchema,
  paymentVerificationSchema,
  dvSubmissionSchema,
} from '../validations/application'

// Infer types from Zod schemas
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type EducationWork = z.infer<typeof educationWorkSchema>
export type PhotoUpload = z.infer<typeof photoSchema>
export type Payment = z.infer<typeof paymentSchema>
export type Application = z.infer<typeof applicationSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type PaymentVerification = z.infer<typeof paymentVerificationSchema>
export type DVSubmission = z.infer<typeof dvSubmissionSchema>

// Database model types (matching Prisma schema)
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'
export type ApplicationStatus = 'DRAFT' | 'PAYMENT_PENDING' | 'PAYMENT_VERIFIED' | 'SUBMITTED' | 'CONFIRMED' | 'EXPIRED'

export interface User {
  id: string
  email: string
  supabaseId: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface ApplicationRecord {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  countryOfBirth: string
  countryOfEligibility: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  education: string
  occupation: string
  photoUrl?: string
  photoValidated: boolean
  paymentReference?: string
  paymentStatus: PaymentStatus
  paymentVerifiedAt?: Date
  paymentVerifiedBy?: string
  status: ApplicationStatus
  submittedAt?: Date
  confirmationNumber?: string
  submittedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  userId?: string
  applicationId?: string
  action: string
  details: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface RetentionPolicy {
  id: string
  name: string
  description: string
  retentionDays: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form step types for multi-step form
export type FormStep = 'personal' | 'contact' | 'education' | 'photo' | 'payment' | 'review'

export interface FormStepData {
  personal?: PersonalInfo
  contact?: ContactInfo
  education?: EducationWork
  photo?: {
    file: File
    preview: string
  }
  payment?: Payment
}

// Photo validation result
export interface PhotoValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    width: number
    height: number
    size: number
    format: string
  }
}