# GitHub Secrets Setup for Deployment

To fix the Supabase client initialization error in GitHub Actions, you need to add the following secrets to your GitHub repository:

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`

### Database Configuration
- `DATABASE_URL`: `postgresql://postgres.your-project-id:your-password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL`: `postgresql://postgres.your-project-id:your-password@aws-1-us-east-1.pooler.supabase.com:5432/postgres`

### Application Configuration
- `NEXT_PUBLIC_APP_URL`: Your production app URL (e.g., `https://yourdomain.com`)

### Google OAuth (Optional)
- `GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET`: `your-google-client-secret`

### Deployment Secrets (Already configured?)
- `HOST`: Your server IP address
- `USERNAME`: SSH username for your server
- `PRIVATE_KEY`: SSH private key for authentication
- `PORT`: SSH port (usually 22)
- `APP_NAME`: Name for your PM2 process
- `DEPLOY_PATH`: Path where the app should be deployed on your server

## What Was Fixed

1. **Updated GitHub Actions workflow** to include environment variables during the build step
2. **Improved Supabase client initialization** to provide better error messages when environment variables are missing
3. **Added environment variable validation** in all Supabase client creation functions

## Next Steps

1. Add all the required secrets to your GitHub repository
2. Push your changes to trigger a new deployment
3. The build should now complete successfully with proper environment variable access

## Security Note

The values shown here are from your local `.env` file. Make sure these are the correct production values for your deployment environment.