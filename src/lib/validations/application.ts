import { z } from 'zod'

// Enums matching Prisma schema
export const genderEnum = z.enum(['MALE', 'FEMALE'])
export const educationLevelEnum = z.enum([
  'PRIMARY_SCHOOL_ONLY',
  'SOME_HIGH_SCHOOL_NO_DIPLOMA', 
  'HIGH_SCHOOL_DIPLOMA',
  'VOCATIONAL_SCHOOL',
  'SOME_UNIVERSITY_COURSES',
  'UNIVERSITY_DEGREE',
  'SOME_GRADUATE_LEVEL_COURSES',
  'MASTER_DEGREE',
  'SOME_DOCTORAL_LEVEL_COURSES',
  'DOCTORATE'
])
export const maritalStatusEnum = z.enum([
  'UNMARRIED',
  'MARRIED_SPOUSE_NOT_US_CITIZEN_LPR',
  'MARRIED_SPOUSE_IS_US_CITIZEN_LPR',
  'DIVORCED',
  'WIDOWED',
  'LEGALLY_SEPARATED'
])

// Personal Information Schema (Primary Applicant)
export const personalInfoSchema = z.object({
  familyName: z.string().min(1, 'Family/Last name is required').max(50, 'Family name must be less than 50 characters'),
  givenName: z.string().min(1, 'Given/First name is required').max(50, 'Given name must be less than 50 characters'),
  middleName: z.string().max(50, 'Middle name must be less than 50 characters').optional(),
  gender: genderEnum,
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  cityOfBirth: z.string().min(1, 'City/Town of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  countryOfEligibility: z.string().min(1, 'Country of eligibility is required'),
  eligibilityClaimType: z.string().optional(), // If claiming spouse's or parent's country
})

// Mailing Address Schema
export const mailingAddressSchema = z.object({
  inCareOf: z.string().max(100, 'In care of must be less than 100 characters').optional(),
  addressLine1: z.string().min(1, 'Address Line 1 is required').max(100, 'Address Line 1 must be less than 100 characters'),
  addressLine2: z.string().max(100, 'Address Line 2 must be less than 100 characters').optional(),
  city: z.string().min(1, 'City/Town is required').max(50, 'City must be less than 50 characters'),
  stateProvince: z.string().min(1, 'District/Province/State is required').max(50, 'State/Province must be less than 50 characters'),
  postalCode: z.string().min(1, 'Postal/ZIP code is required').max(20, 'Postal code must be less than 20 characters'),
  country: z.string().min(1, 'Country is required'),
  countryOfResidence: z.string().min(1, 'Country where you live today is required'),
})

// Contact Information Schema
export const contactInfoSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters'),
  email: z.string().refine((val) => val === '' || z.string().email().safeParse(val).success, {
    message: 'Invalid email address'
  }).optional(),
})

// Education Schema
export const educationSchema = z.object({
  educationLevel: educationLevelEnum,
})

// Marital Status and Spouse Schema
export const maritalStatusSchema = z.object({
  maritalStatus: maritalStatusEnum,
  // Spouse information (conditional based on marital status)
  spouseFamilyName: z.string().max(50, 'Spouse family name must be less than 50 characters').optional(),
  spouseGivenName: z.string().max(50, 'Spouse given name must be less than 50 characters').optional(),
  spouseMiddleName: z.string().max(50, 'Spouse middle name must be less than 50 characters').optional(),
  spouseGender: genderEnum.optional(),
  spouseDateOfBirth: z.string().optional(),
  spouseCityOfBirth: z.string().max(50, 'Spouse city of birth must be less than 50 characters').optional(),
  spouseCountryOfBirth: z.string().optional(),
}).refine((data) => {
  // If married and spouse is NOT US citizen/LPR, spouse details are required
  if (data.maritalStatus === 'MARRIED_SPOUSE_NOT_US_CITIZEN_LPR') {
    return data.spouseFamilyName && data.spouseGivenName && data.spouseGender && 
           data.spouseDateOfBirth && data.spouseCityOfBirth && data.spouseCountryOfBirth
  }
  return true
}, {
  message: 'Spouse details are required when married to non-US citizen/LPR',
  path: ['spouseFamilyName']
})

// Child Schema
export const childSchema = z.object({
  familyName: z.string().min(1, 'Child family name is required').max(50, 'Family name must be less than 50 characters'),
  givenName: z.string().min(1, 'Child given name is required').max(50, 'Given name must be less than 50 characters'),
  middleName: z.string().max(50, 'Middle name must be less than 50 characters').optional(),
  gender: genderEnum,
  dateOfBirth: z.string().min(1, 'Child date of birth is required'),
  cityOfBirth: z.string().min(1, 'Child city of birth is required').max(50, 'City must be less than 50 characters'),
  countryOfBirth: z.string().min(1, 'Child country of birth is required'),
  photoUrl: z.string().optional(),
})

// Children Schema (array of children)
export const childrenSchema = z.object({
  children: z.array(childSchema).max(10, 'Maximum 10 children allowed'),
})

// Photo Upload Schema
export const photoSchema = z.object({
  file: z.instanceof(File, { message: 'Photo file is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Photo must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Photo must be JPEG or PNG format'
    ),
})

// Payment Schema
export const paymentSchema = z.object({
  paymentReference: z.string()
    .min(10, 'Payment reference must be at least 10 characters')
    .max(50, 'Payment reference must be less than 50 characters')
    .regex(/^[A-Z0-9]+$/, 'Payment reference must contain only uppercase letters and numbers'),
})

// Photo URLs Schema (for submission)
export const photoUrlsSchema = z.object({
  photoUrl: z.string().optional(),
  spousePhotoUrl: z.string().optional(),
})

// Complete Application Schema
export const applicationSchema = personalInfoSchema
  .merge(mailingAddressSchema)
  .merge(contactInfoSchema)
  .merge(educationSchema)
  .merge(maritalStatusSchema)
  .merge(childrenSchema)
  .merge(photoUrlsSchema)
  .merge(z.object({
    paymentReference: z.string().optional()
  }))

// User Registration Schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Admin Payment Verification Schema
export const paymentVerificationSchema = z.object({
  applicationId: z.string().cuid('Invalid application ID'),
  status: z.enum(['VERIFIED', 'REJECTED'], {
    message: 'Payment status is required',
  }),
  notes: z.string().optional(),
})

// DV Submission Schema
export const dvSubmissionSchema = z.object({
  applicationId: z.string().cuid('Invalid application ID'),
  confirmationNumber: z.string().min(1, 'Confirmation number is required'),
  notes: z.string().optional(),
})