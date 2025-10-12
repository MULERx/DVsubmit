# Authentication Flow Documentation

## Overview
The authentication system uses Supabase Auth with TanStack Query, React Hook Form, and Zod validation for a modern, type-safe experience.

## Pages and Routes

### Login (`/login`)
- **Form validation**: Email and password with Zod schema
- **Features**: 
  - Email/password login
  - Google OAuth
  - "Forgot password" link
  - Form validation with error messages
  - Loading states

### Register (`/register`)
- **Form validation**: Email, password, and password confirmation
- **Features**:
  - Email/password registration
  - Google OAuth
  - Password confirmation validation
  - Success page with email confirmation message
  - Form validation with error messages

### Forgot Password (`/forgot-password`)
- **Form validation**: Email only
- **Features**:
  - Send password reset email
  - Success page with instructions
  - Option to send another email
  - Form validation

### Reset Password (`/auth/reset-password`)
- **Form validation**: New password and confirmation
- **Features**:
  - Validates reset session from email link
  - Password and confirmation fields
  - Redirects to dashboard on success
  - Auto-redirects to forgot password if no valid session
  - Handles expired/invalid links with proper error messages
  - Shows "Request New Reset Link" button for expired links

## Technical Implementation

### Validation Schemas (`src/lib/validations/auth.ts`)
```typescript
- loginSchema: email + password (min 6 chars)
- registerSchema: email + password + confirmPassword with match validation
- forgotPasswordSchema: email only
- resetPasswordSchema: password + confirmPassword with match validation
```

### Mutations (`src/hooks/use-auth-mutations.ts`)
```typescript
- useLoginMutation(): handles login with redirect to dashboard
- useRegisterMutation(): handles registration
- useGoogleSignInMutation(): handles Google OAuth
- useForgotPasswordMutation(): sends password reset email
- useResetPasswordMutation(): updates password and redirects
```

### Auth Helpers (`src/lib/auth/auth-helpers.ts`)
- `authClient.resetPassword(email)`: Sends reset email via Supabase
- `authClient.updatePassword(password)`: Updates user password
- Proper redirect URLs configured for all flows

## Flow Diagrams

### Password Reset Flow
1. User clicks "Forgot password" on login page
2. Redirected to `/forgot-password`
3. User enters email and submits
4. Supabase sends email with reset link to `/auth/reset-password?access_token=...&refresh_token=...`
5. User clicks email link
6. Reset password page validates tokens:
   - If valid: Shows password reset form
   - If expired/invalid: Shows error with "Request New Reset Link" button
7. User enters new password
8. Session set with tokens, then password updated via Supabase
9. User redirected to dashboard with success message

### Error Handling for Expired Links
- URL parameters like `?error=access_denied&error_code=otp_expired` are detected
- User sees friendly error message explaining the link has expired
- "Request New Reset Link" button redirects to `/forgot-password`
- No form is shown for expired/invalid sessions

### Registration Flow
1. User goes to `/register`
2. Fills form and submits
3. Supabase sends confirmation email
4. Success page shows "check your email" message
5. User clicks confirmation link in email
6. Redirected to `/auth/callback` which handles the confirmation
7. User redirected to dashboard

## Error Handling
- All forms show validation errors in real-time
- API errors are displayed via toast notifications
- Network errors are handled gracefully
- Invalid reset sessions redirect to forgot password page

## Security Features
- Password minimum length: 6 characters
- Email validation
- Password confirmation matching
- Secure token-based password reset
- Session validation for reset password page
- CSRF protection via Supabase