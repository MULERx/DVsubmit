'use client'

import { RealtimeConnectionStatus } from '@/lib/realtime/realtime-service'
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConnectionStatusProps {
  status: RealtimeConnectionStatus
  lastUpdated?: Date | null
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ConnectionStatus({ 
  status, 
  lastUpdated, 
  className,
  showText = true,
  size = 'sm'
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Live',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          iconColor: 'text-green-500',
          dotColor: 'bg-green-500',
          animation: 'animate-pulse'
        }
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-500',
          dotColor: 'bg-yellow-500',
          animation: 'animate-spin'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-500',
          dotColor: 'bg-gray-500',
          animation: ''
        }
      case 'error':
        return {
          icon: AlertTriangle,
          text: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          iconColor: 'text-red-500',
          dotColor: 'bg-red-500',
          animation: ''
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      dot: 'w-2 h-2',
      icon: 'h-3 w-3',
      gap: 'gap-1'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      dot: 'w-2.5 h-2.5',
      icon: 'h-4 w-4',
      gap: 'gap-1.5'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      dot: 'w-3 h-3',
      icon: 'h-5 w-5',
      gap: 'gap-2'
    }
  }

  const sizeClass = sizeClasses[size]

  return (
    <div 
      className={cn(
        'flex items-center rounded-full',
        config.bgColor,
        config.textColor,
        sizeClass.container,
        sizeClass.gap,
        className
      )}
      title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : undefined}
    >
 
      
      {showText && (
        <>
          <Icon className={cn(config.iconColor, sizeClass.icon)} />
          <span className="font-medium">{config.text}</span>
        </>
      )}
    </div>
  )
}

export interface ConnectionStatusWithDetailsProps extends ConnectionStatusProps {
  showDetails?: boolean
  errorMessage?: string
}

export function ConnectionStatusWithDetails({
  showDetails = false,
  errorMessage,
  ...props
}: ConnectionStatusWithDetailsProps) {
  if (!showDetails) {
    return <ConnectionStatus {...props} />
  }

  return (
    <div className="space-y-1">
      <ConnectionStatus {...props} />
      
      {props.lastUpdated && (
        <div className="text-xs text-gray-500">
          Last updated: {props.lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {props.status === 'error' && errorMessage && (
        <div className="text-xs text-red-600 max-w-xs">
          {errorMessage}
        </div>
      )}
    </div>
  )
}