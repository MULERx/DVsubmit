'use client'

import { useCallback } from 'react'
import { useRealtimeStatistics } from '@/hooks/use-realtime-statistics'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectionStatusWithDetails } from './connection-status'
import { StatisticsGrid } from './statistics-grid'

export function QuickStatistics() {
  // Stable callback functions to prevent hook re-initialization
  const handleError = useCallback((error: Error) => {
    console.error('Statistics error:', error)
  }, [])

  const handleConnectionChange = useCallback(() => {
    // Connection status changes are handled internally by the hook
  }, [])

  const { 
    data: statistics, 
    isLoading, 
    error, 
    refetch, 
    isRefetching, 
    connectionStatus,
    lastUpdated
  } = useRealtimeStatistics({
    enableRealtime: true,
    onError: handleError,
    onConnectionChange: handleConnectionChange
  })



  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Statistics</h3>
            <ConnectionStatusWithDetails
              status={connectionStatus}
              lastUpdated={lastUpdated}
              showDetails={connectionStatus === 'error'}
              errorMessage={error?.message}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load statistics</span>
            </div>
            {error?.message?.includes('Unauthorized') && (
              <div className="text-sm text-red-600 mt-2">
                <p className="font-medium">Realtime Authorization Issue</p>
                <p className="text-xs mt-1">
                  Please run the RLS setup SQL commands in your Supabase dashboard.
                  Check the REALTIME_TROUBLESHOOTING.md file for instructions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Statistics</h3>
          <ConnectionStatusWithDetails
            status={connectionStatus}
            lastUpdated={lastUpdated}
            showDetails={false}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      
      <StatisticsGrid statistics={statistics} isLoading={isLoading} />
    </div>
  )
}