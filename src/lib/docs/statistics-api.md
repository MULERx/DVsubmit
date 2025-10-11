# Quick Statistics API & TanStack Query Integration

This document describes the Quick Statistics API and how to use it with TanStack Query.

## API Endpoint

**GET** `/api/admin/statistics`

### Authentication
- Requires admin or super admin role
- Returns 401 if not authenticated
- Returns 403 if insufficient permissions

### Response Format
```json
{
  "success": true,
  "data": {
    "totalSubmittedApplications": 150,
    "pendingPaymentVerify": 25,
    "pendingReviewAndSubmit": 20,
    "submittedToDV": 100
  }
}
```

## TanStack Query Hook

### Basic Usage

```tsx
import { useStatistics } from '@/hooks/use-statistics'

function MyComponent() {
  const { data: statistics, isLoading, error, refetch } = useStatistics()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading statistics</div>

  return (
    <div>
      <h2>Total Applications: {statistics?.totalSubmittedApplications}</h2>
      <h2>Pending Payment Verify: {statistics?.pendingPaymentVerify}</h2>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  )
}
```

### Advanced Usage with Error Handling

```tsx
import { useStatistics } from '@/hooks/use-statistics'
import { useToast } from '@/hooks/use-toast'

function StatisticsWidget() {
  const { toast } = useToast()
  const { 
    data: statistics, 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useStatistics()

  // Handle errors
  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load statistics',
      variant: 'destructive',
    })
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard 
        title="Total Applications"
        value={statistics?.totalSubmittedApplications || 0}
        isLoading={isLoading}
      />
      <StatCard 
        title="Pending Payment Verify"
        value={statistics?.pendingPaymentVerify || 0}
        isLoading={isLoading}
      />
      {/* More stat cards... */}
    </div>
  )
}
```

## Features

### Auto-refresh
- Data automatically refetches every 30 seconds
- Data is considered stale after 15 seconds
- Manual refresh available via `refetch()` function

### Caching
- Uses TanStack Query's intelligent caching
- Cached data is shared across components
- Background updates when data becomes stale

### Loading States
- `isLoading`: Initial load
- `isRefetching`: Background refresh
- `isFetching`: Any fetch operation

### Error Handling
- Automatic retry on network errors
- Error state management
- Toast notifications for user feedback

## Components

### QuickStatistics Component
Located at `src/components/admin/quick-statistics.tsx`

Features:
- Real-time statistics display
- Loading animations
- Error states with retry
- Manual refresh button
- Responsive grid layout

### Usage in Admin Dashboard
```tsx
import { QuickStatistics } from '@/components/admin/quick-statistics'

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <QuickStatistics />
    </div>
  )
}
```

## Configuration

### Query Client Setup
The QueryProvider is configured in `src/lib/providers/query-provider.tsx` with:
- 1-minute stale time
- Disabled refetch on window focus
- React Query DevTools in development

### Global Setup
Added to root layout (`src/app/layout.tsx`) to provide query client to entire app.

## Statistics Metrics

| Metric | Description |
|--------|-------------|
| `totalSubmittedApplications` | Total number of submitted DV applications |
| `pendingPaymentVerify` | Applications with pending payment verification (paymentStatus: 'PENDING') |
| `pendingReviewAndSubmit` | Applications ready for review and DV submission (status: 'PAYMENT_VERIFIED') |
| `submittedToDV` | Applications successfully submitted to DV system (status: 'SUBMITTED' or 'CONFIRMED') |

## Security

- Admin/Super Admin role required
- Supabase authentication integration
- Database user role verification
- Secure API endpoints with proper error handling