# Supabase Realtime Setup for Quick Statistics

This guide will help you set up realtime updates for the admin dashboard statistics.

## Prerequisites

1. Supabase project with the applications table
2. Admin access to your Supabase dashboard
3. Proper authentication setup

## Setup Steps

### 1. Enable Realtime in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the `applications` table in the list
4. Toggle the **Realtime** switch to enable it for the `applications` table

### 2. Run SQL Commands

Execute the following SQL commands in your Supabase SQL Editor:

```sql
-- Enable realtime for the applications table
ALTER PUBLICATION supabase_realtime ADD TABLE applications;

-- Enable Row Level Security (RLS) for realtime (if not already enabled)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create a policy for admins to access realtime data
CREATE POLICY "Admins can access applications realtime" ON applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid() 
    AND users.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Grant necessary permissions for realtime
GRANT SELECT ON applications TO authenticated;
GRANT SELECT ON users TO authenticated;
```

### 3. Environment Variables

Make sure your `.env.local` file has the correct Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
```

### 4. Test the Setup

1. Open the admin dashboard in your browser
2. Look for the "Live" indicator next to "Quick Statistics"
3. In another browser tab/window, create or update an application
4. The statistics should update automatically without refreshing the page

## Features

### Real-time Updates
- Statistics update instantly when applications are created, updated, or deleted
- No need to manually refresh the page
- Optimized incremental updates for better performance

### Connection Status Indicator
- **Live** (green): Connected and receiving real-time updates
- **Connecting** (yellow): Establishing connection
- **Disconnected** (gray): Connection lost, will attempt to reconnect
- **Error** (red): Connection error, manual refresh may be needed

### Fallback Mechanism
- If real-time connection fails, falls back to periodic polling
- Manual refresh button always available
- Graceful error handling

## Troubleshooting

### Connection Issues
1. Check if realtime is enabled for the `applications` table in Supabase
2. Verify RLS policies allow admin access
3. Check browser console for connection errors
4. Ensure Supabase environment variables are correct

### Statistics Not Updating
1. Verify the SQL policies are correctly applied
2. Check if the user has admin role in the database
3. Look for JavaScript errors in browser console
4. Try manual refresh to see if API endpoint works

### Performance Considerations
- The optimized version calculates changes incrementally
- Reduces API calls and database load
- Handles edge cases like negative counts
- Falls back to full refresh if incremental update fails

## Code Structure

- `src/hooks/use-optimized-realtime-statistics.ts` - Main realtime hook
- `src/components/admin/quick-statistics.tsx` - UI component with status indicators
- `src/components/admin/realtime-test.tsx` - Test component to verify realtime functionality
- `src/app/api/admin/statistics/route.ts` - API endpoint for statistics

## Testing Component

To test the realtime functionality, you can temporarily add the `RealtimeTest` component to your admin page:

```tsx
import { RealtimeTest } from "@/components/admin/realtime-test";

// Add this somewhere in your admin dashboard
<RealtimeTest />
```

This component will show real-time events as they happen, helping you verify that the setup is working correctly.

## Security

- Only authenticated admin users can access realtime data
- Row Level Security (RLS) policies enforce access control
- Real-time subscriptions respect the same permissions as API calls