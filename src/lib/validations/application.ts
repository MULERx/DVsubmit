import { z } from 'zod'

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  countryOfEligibility: z.string().min(1, 'Country of eligibility is required'),
})

// Contact Information Schema
export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
})

// Education and Work Schema
export const educationWorkSchema = z.object({
  education: z.enum(['primary', 'secondary', 'vocational', 'university', 'graduate'], {
    message: 'Education level is required',
  }),
  occupation: z.string().min(1, 'Occupation is required').max(100, 'Occupation must be less than 100 characters'),
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

// Complete Application Schema
export const applicationSchema = personalInfoSchema
  .merge(contactInfoSchema)
  .merge(educationWorkSchema)

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