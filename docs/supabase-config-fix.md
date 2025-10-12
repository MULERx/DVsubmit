# 🔧 Supabase Configuration Fix for Password Reset

## Problem Identified
Your password reset links are immediately expiring because of Supabase dashboard configuration issues.

**Current Error Pattern:**
```
URL: /auth/reset-password?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## 🛠️ Step-by-Step Fix

### Step 1: Update Site URL
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ntzsbuboifpexxmkaifi`
3. Go to **Settings → General**
4. Set **Site URL** to: `http://localhost:3000`
5. Click **Save**

### Step 2: Configure Redirect URLs
1. Go to **Authentication → URL Configuration**
2. In **"Redirect URLs"** section, add these URLs (one per line):
   ```
   http://localhost:3000/auth/reset-password
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
3. Click **Save**

### Step 3: Fix Email Template
1. Go to **Authentication → Email Templates**
2. Select **"Reset Password"** template
3. Replace the template content with:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/auth/reset-password?token={{ .TokenHash }}&type=recovery">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Thanks,<br>The DVSubmit Team</p>
```

**Important:** Make sure the link uses:
- `{{ .SiteURL }}` (not `{{ .ConfirmationURL }}`)
- `?token={{ .TokenHash }}&type=recovery` parameters

### Step 4: Verify Configuration
After making changes:
1. Wait 2-3 minutes for changes to propagate
2. Test the forgot password flow again
3. Check that the email link format is:
   ```
   http://localhost:3000/auth/reset-password?token=abc123...&type=recovery
   ```

## 🔍 What Was Wrong

### Before (Incorrect):
- Site URL: Not set or incorrect
- Email template: Using `{{ .ConfirmationURL }}` 
- Redirect URLs: Missing or incorrect
- Result: Immediate token expiration

### After (Correct):
- Site URL: `http://localhost:3000`
- Email template: Uses `{{ .SiteURL }}/auth/reset-password?token={{ .TokenHash }}&type=recovery`
- Redirect URLs: Properly whitelisted
- Result: Working password reset flow

## 🧪 Testing the Fix

1. Go to `/forgot-password`
2. Enter your email address
3. Check your email - the link should now look like:
   ```
   http://localhost:3000/auth/reset-password?token=eyJ...&type=recovery
   ```
4. Click the link - you should see the password reset form (not an error)

## 🚨 Common Mistakes to Avoid

1. **Don't use** `{{ .ConfirmationURL }}` in email templates
2. **Don't forget** the `type=recovery` parameter
3. **Make sure** Site URL matches your `NEXT_PUBLIC_APP_URL` exactly
4. **Wait** 2-3 minutes after making changes before testing

## 📱 For Production

When you deploy to production:
1. Update Site URL to your production domain
2. Add production URLs to Redirect URLs:
   ```
   https://yourdomain.com/auth/reset-password
   https://yourdomain.com/auth/callback
   https://yourdomain.com/**
   ```
3. Update your production `.env`:
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

This should completely fix your password reset issue!