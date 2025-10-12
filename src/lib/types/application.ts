import { z } from 'zod'
import {
  personalInfoSchema,
  mailingAddressSchema,
  contactInfoSchema,
  educationSchema,
  maritalStatusSchema,
  childSchema,
  childrenSchema,
  photoSchema,
  paymentSchema,
  applicationSchema,
  registerSchema,
  loginSchema,
  paymentVerificationSchema,
  dvSubmissionSchema,
  genderEnum,
  educationLevelEnum,
  maritalStatusEnum,
} from '../validations/application'

// Infer types from Zod schemas
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type MailingAddress = z.infer<typeof mailingAddressSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type Education = z.infer<typeof educationSchema>
export type MaritalStatusInfo = z.infer<typeof maritalStatusSchema>
export type Child = z.infer<typeof childSchema>
export type Children = z.infer<typeof childrenSchema>
export type PhotoUpload = z.infer<typeof photoSchema>
export type Payment = z.infer<typeof paymentSchema>
export type Application = z.infer<typeof applicationSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type PaymentVerification = z.infer<typeof paymentVerificationSchema>
export type DVSubmission = z.infer<typeof dvSubmissionSchema>

// Enum types
export type Gender = z.infer<typeof genderEnum>
export type EducationLevel = z.infer<typeof educationLevelEnum>
export type MaritalStatus = z.infer<typeof maritalStatusEnum>

// Database model types (matching Prisma schema)
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'
export type ApplicationStatus = 'PAYMENT_PENDING' | 'PAYMENT_VERIFIED' | 'PAYMENT_REJECTED' | 'APPLICATION_REJECTED' | 'SUBMITTED'

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
  
  // Personal Information (Primary Applicant)
  familyName: string
  givenName: string
  middleName?: string
  gender: Gender
  dateOfBirth: Date
  cityOfBirth: string
  countryOfBirth: string
  countryOfEligibility: string
  eligibilityClaimType?: string
  
  // Photo
  photoUrl?: string
  photoValidated: boolean
  
  // Mailing Address
  inCareOf?: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  countryOfResidence: string
  
  // Contact Information
  phoneNumber?: string
  email: string
  
  // Education
  educationLevel: EducationLevel
  
  // Marital Status
  maritalStatus: MaritalStatus
  
  // Spouse Information (if applicable)
  spouseFamilyName?: string
  spouseGivenName?: string
  spouseMiddleName?: string
  spouseGender?: Gender
  spouseDateOfBirth?: Date
  spouseCityOfBirth?: string
  spouseCountryOfBirth?: string
  spousePhotoUrl?: string
  
  // Children (separate table relation)
  children?: ChildRecord[]
  
  // Payment
  paymentReference?: string
  paymentVerifiedAt?: Date
  paymentVerifiedBy?: string
  
  // Submission
  status: ApplicationStatus
  submittedAt?: Date
  confirmationNumber?: string
  submittedBy?: string
  rejectionNote?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface ChildRecord {
  id: string
  applicationId: string
  familyName: string
  givenName: string
  middleName?: string
  gender: Gender
  dateOfBirth: Date
  cityOfBirth: string
  countryOfBirth: string
  photoUrl?: string
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
export type FormStep = 'personal' | 'address' | 'contact' | 'education' | 'marital' | 'children' | 'photo' | 'review'

export interface FormStepData {
  personal?: PersonalInfo
  address?: MailingAddress
  contact?: ContactInfo
  education?: Education
  marital?: MaritalStatusInfo
  children?: Children
  photo?: {
    file: File
    preview: string
    path?: string
    signedUrl?: string
  }
  spousePhoto?: {
    file: File
    preview: string
    path?: string
    signedUrl?: string
  }
  childrenPhotos?: {
    [childIndex: number]: {
      file: File
      preview: string
      path?: string
      signedUrl?: string
    }
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