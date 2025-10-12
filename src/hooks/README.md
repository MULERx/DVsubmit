# TanStack Query Hooks with Prisma Types

This directory contains TanStack Query hooks that provide type-safe data fetching and mutations using Prisma-generated types.

## Admin Application Hooks

### Queries

#### `useAdminApplication(id, enabled?)`
Fetches a single application with full details including user and children relations.

```tsx
import { useAdminApplication } from '@/hooks/use-admin-application-queries'

function ApplicationDetailPage() {
  const { data: application, isLoading, error, refetch } = useAdminApplication(applicationId)
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!application) return <div>Application not found</div>
  
  return (
    <div>
      <h1>{application.givenName} {application.familyName}</h1>
      <p>Status: {application.status}</p>
      <p>User: {application.user.email}</p>
      <p>Children: {application.children.length}</p>
    </div>
  )
}
```

#### `useAdminApplications(params?, enabled?)`
Fetches a paginated list of applications with filtering and sorting.

```tsx
import { useAdminApplications } from '@/hooks/use-admin-applications-queries'

function ApplicationsListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>()
  
  const { data, isLoading, error } = useAdminApplications({
    page,
    limit: 10,
    status,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {data?.applications.map(app => (
        <div key={app.id}>
          {app.givenName} {app.familyName} - {app.status}
        </div>
      ))}
      
      <button 
        onClick={() => setPage(p => p + 1)}
        disabled={page >= (data?.total || 0) / 10}
      >
        Next Page
      </button>
    </div>
  )
}
```

### Mutations

#### `usePaymentStatusMutation()`
Updates payment status (approve/reject) with automatic cache invalidation.

```tsx
import { usePaymentStatusMutation } from '@/hooks/use-admin-application-mutations'

function PaymentActions({ applicationId }: { applicationId: string }) {
  const paymentMutation = usePaymentStatusMutation()
  
  const handleApprove = () => {
    paymentMutation.mutate({ 
      applicationId, 
      action: 'approve' 
    })
  }
  
  const handleReject = () => {
    paymentMutation.mutate({ 
      applicationId, 
      action: 'reject' 
    })
  }
  
  return (
    <div>
      <button 
        onClick={handleApprove}
        disabled={paymentMutation.isPending}
      >
        {paymentMutation.isPending && paymentMutation.variables?.action === 'approve' 
          ? 'Approving...' 
          : 'Approve Payment'
        }
      </button>
      
      <button 
        onClick={handleReject}
        disabled={paymentMutation.isPending}
      >
        {paymentMutation.isPending && paymentMutation.variables?.action === 'reject' 
          ? 'Rejecting...' 
          : 'Reject Payment'
        }
      </button>
    </div>
  )
}
```

#### `useApplicationRejectionMutation()`
Rejects an entire application with automatic cache invalidation.

```tsx
import { useApplicationRejectionMutation } from '@/hooks/use-admin-application-mutations'

function ApplicationActions({ applicationId }: { applicationId: string }) {
  const rejectionMutation = useApplicationRejectionMutation()
  
  const handleReject = () => {
    rejectionMutation.mutate({ applicationId })
  }
  
  return (
    <button 
      onClick={handleReject}
      disabled={rejectionMutation.isPending}
    >
      {rejectionMutation.isPending ? 'Rejecting...' : 'Reject Application'}
    </button>
  )
}
```

## Key Features

- **Type Safety**: All hooks use Prisma-generated types for complete type safety
- **Automatic Cache Management**: Mutations automatically invalidate related queries
- **Error Handling**: Built-in error handling with toast notifications
- **Loading States**: Proper loading states for better UX
- **Optimistic Updates**: Cache invalidation ensures fresh data after mutations
- **Retry Logic**: Automatic retry for failed requests

## Best Practices

1. **Enable/Disable Queries**: Use the `enabled` parameter to conditionally fetch data
2. **Error Boundaries**: Wrap components using these hooks in error boundaries
3. **Loading States**: Always handle loading states in your UI
4. **Cache Keys**: Query keys are automatically managed for optimal caching
5. **Mutations**: Use mutation loading states to disable buttons and show progress