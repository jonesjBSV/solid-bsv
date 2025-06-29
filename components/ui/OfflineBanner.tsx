'use client'

/**
 * Offline Banner Component
 * Shows connectivity status and retry options
 */

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOfflineBanner, useNetworkInfo } from '@/hooks/useOnlineStatus'
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  X, 
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineBanner() {
  const { showBanner, isOnline, retryConnection, dismissBanner } = useOfflineBanner()
  const networkInfo = useNetworkInfo()

  const getSignalIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return <SignalLow className="h-4 w-4" />
      case '3g':
        return <SignalMedium className="h-4 w-4" />
      case '4g':
        return <SignalHigh className="h-4 w-4" />
      default:
        return <Wifi className="h-4 w-4" />
    }
  }

  const getConnectionBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive">Offline</Badge>
    }

    if (networkInfo.effectiveType) {
      const type = networkInfo.effectiveType.toUpperCase()
      const variant = ['slow-2g', '2g'].includes(networkInfo.effectiveType) ? 'secondary' : 'default'
      return <Badge variant={variant}>{type}</Badge>
    }

    return <Badge variant="default">Online</Badge>
  }

  const getConnectionSpeed = () => {
    if (!isOnline || !networkInfo.downlink) return null
    
    if (networkInfo.downlink < 0.5) return 'Slow'
    if (networkInfo.downlink < 2) return 'Moderate'
    return 'Fast'
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -50, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full"
      >
        <Alert 
          className={`border-0 rounded-none ${
            isOnline 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:text-green-100' 
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:text-red-100'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getSignalIcon()}
                {getConnectionBadge()}
              </div>
              
              <AlertDescription className="flex items-center gap-4">
                {isOnline ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Connection restored</span>
                    {getConnectionSpeed() && (
                      <span className="text-sm opacity-75">
                        • {getConnectionSpeed()} connection
                      </span>
                    )}
                    {networkInfo.saveData && (
                      <Badge variant="outline" className="text-xs">
                        Data Saver
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="font-medium">You're currently offline</span>
                    <span className="text-sm opacity-75">
                      Some features may not be available
                    </span>
                  </div>
                )}
              </AlertDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryConnection}
                  className="h-8 px-3 bg-white/20 hover:bg-white/30 border-white/30"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissBanner}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  )
}

// Compact offline indicator for header/navbar
export function OfflineIndicator() {
  const { isOnline } = useOfflineBanner()
  const networkInfo = useNetworkInfo()

  if (isOnline) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-2"
    >
      <div className="relative">
        <WifiOff className="h-4 w-4 text-red-500" />
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
      </div>
      <span className="text-sm text-red-600 dark:text-red-400">Offline</span>
    </motion.div>
  )
}

// Network status component for settings/debug
export function NetworkStatus() {
  const { isOnline, lastOnlineAt, lastOfflineAt, retryConnection } = useOfflineBanner()
  const networkInfo = useNetworkInfo()

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Network Status</h3>
        <div className="flex items-center gap-2">
          {getSignalIcon()}
          {getConnectionBadge()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium mb-1">Connection</div>
          <div className="text-muted-foreground">
            {isOnline ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        {networkInfo.effectiveType && (
          <div>
            <div className="font-medium mb-1">Type</div>
            <div className="text-muted-foreground">
              {networkInfo.effectiveType.toUpperCase()}
            </div>
          </div>
        )}
        
        {networkInfo.downlink && (
          <div>
            <div className="font-medium mb-1">Speed</div>
            <div className="text-muted-foreground">
              {networkInfo.downlink} Mbps
            </div>
          </div>
        )}
        
        {networkInfo.rtt && (
          <div>
            <div className="font-medium mb-1">Latency</div>
            <div className="text-muted-foreground">
              {networkInfo.rtt}ms
            </div>
          </div>
        )}
      </div>

      {lastOfflineAt && (
        <div className="text-sm text-muted-foreground">
          {isOnline 
            ? `Last offline: ${lastOfflineAt.toLocaleString()}`
            : `Offline since: ${lastOfflineAt.toLocaleString()}`
          }
        </div>
      )}

      {!isOnline && (
        <Button onClick={retryConnection} size="sm" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Test Connection
        </Button>
      )}
    </div>
  )

  function getSignalIcon() {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return <SignalLow className="h-4 w-4" />
      case '3g':
        return <SignalMedium className="h-4 w-4" />
      case '4g':
        return <SignalHigh className="h-4 w-4" />
      default:
        return <Wifi className="h-4 w-4" />
    }
  }

  function getConnectionBadge() {
    if (!isOnline) {
      return <Badge variant="destructive">Offline</Badge>
    }

    if (networkInfo.effectiveType) {
      const type = networkInfo.effectiveType.toUpperCase()
      const variant = ['slow-2g', '2g'].includes(networkInfo.effectiveType) ? 'secondary' : 'default'
      return <Badge variant={variant}>{type}</Badge>
    }

    return <Badge variant="default">Online</Badge>
  }
}