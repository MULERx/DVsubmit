// Application Configuration Constants

export const APP_CONFIG = {
  name: "DVSubmit",
  description: "DV Lottery Submission Service",
  version: "1.0.0",
  supportEmail: "support@dvsubmit.com",
} as const;

// DV Lottery Configuration
export const DV_CONFIG = {
  serviceFee: 399, // ETB
  currency: "ETB",
  photoRequirements: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ["image/jpeg", "image/jpg", "image/png"],
    minWidth: 600,
    minHeight: 600,
    maxWidth: 1200,
    maxHeight: 1200,
    aspectRatio: 1, // Square photos required
  },
  countries: {
    eligible: [
      "Ethiopia",
      // Add other eligible countries as needed
    ],
    birth: [
      "Ethiopia",
      // Add other countries as needed
    ],
  },
} as const;

// Form Configuration
export const FORM_CONFIG = {
  steps: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Basic personal details",
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "Address and contact details",
    },
    {
      id: "education",
      title: "Education & Work",
      description: "Education and occupation details",
    },
    {
      id: "photo",
      title: "Photo Upload",
      description: "Upload your DV lottery photo",
    },
    {
      id: "payment",
      title: "Payment",
      description: "Pay service fee via Telebirr",
    },
    {
      id: "review",
      title: "Review & Submit",
      description: "Review and submit your application",
    },
  ],
  autoSaveInterval: 30000, // 30 seconds
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_APP_URL || process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://dvsubmit.com",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
  buckets: {
    photos: "dv-photos",
    documents: "dv-documents",
  },
  signedUrlExpiry: 3600, // 1 hour
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  required: "This field is required",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  fileSize: (max: string) => `File size must be less than ${max}`,
  fileType: (types: string[]) => `File must be one of: ${types.join(", ")}`,
} as const;

// Route Configuration
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  application: "/application",
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminApplications: "/admin/applications",
  adminPayments: "/admin/payments",
  adminSubmissions: "/admin/submissions",
  adminAudit: "/admin/audit",
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_SUBMISSION: "DUPLICATE_SUBMISSION",
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  PHOTO_VALIDATION_FAILED: "PHOTO_VALIDATION_FAILED",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

// Audit Action Types
export const AUDIT_ACTIONS = {
  USER_REGISTERED: "USER_REGISTERED",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  APPLICATION_CREATED: "APPLICATION_CREATED",
  APPLICATION_UPDATED: "APPLICATION_UPDATED",
  APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
  PHOTO_UPLOADED: "PHOTO_UPLOADED",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  DV_SUBMITTED: "DV_SUBMITTED",
  DV_CONFIRMED: "DV_CONFIRMED",
  DATA_DELETED: "DATA_DELETED",
  ADMIN_ACCESS: "ADMIN_ACCESS",
} as const;
