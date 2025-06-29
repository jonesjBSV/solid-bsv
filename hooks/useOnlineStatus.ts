'use client'

/**
 * Online Status Hook
 * Monitors network connectivity and provides offline/online state
 */

import { useState, useEffect } from 'react'

interface OnlineStatusOptions {
  onOnline?: () => void
  onOffline?: () => void
  pingUrl?: string
  pingInterval?: number
  checkOnMount?: boolean
}

interface OnlineStatus {
  isOnline: boolean
  isOffline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
  connectionType: string | null
  ping: () => Promise<boolean>
  retryConnection: () => void
}

export function useOnlineStatus(options: OnlineStatusOptions = {}): OnlineStatus {
  const {
    onOnline,
    onOffline,
    pingUrl = '/api/health',
    pingInterval = 30000, // 30 seconds
    checkOnMount = true
  } = options

  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null)
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | null>(null)
  const [connectionType, setConnectionType] = useState<string | null>(null)

  // Ping function to check server connectivity
  const ping = async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.warn('Ping failed:', error)
      return false
    }
  }

  // Update connection type if available
  const updateConnectionType = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection?.effectiveType || connection?.type || null)
    }
  }

  // Handle online status change
  const handleOnline = () => {
    setIsOnline(true)
    setLastOnlineAt(new Date())
    updateConnectionType()
    onOnline?.()
    console.log('🟢 Connection restored')
  }

  // Handle offline status change
  const handleOffline = () => {
    setIsOnline(false)
    setLastOfflineAt(new Date())
    setConnectionType(null)
    onOffline?.()
    console.log('🔴 Connection lost')
  }

  // Retry connection manually
  const retryConnection = async () => {
    console.log('🔄 Retrying connection...')
    const isConnected = await ping()
    
    if (isConnected && !isOnline) {
      handleOnline()
    } else if (!isConnected && isOnline) {
      handleOffline()
    }
  }

  // Set up event listeners and periodic checks
  useEffect(() => {
    // Initialize online status
    if (checkOnMount) {
      setIsOnline(navigator.onLine)
      updateConnectionType()
      
      // Verify with ping if initially online
      if (navigator.onLine) {
        ping().then(result => {
          if (!result) {
            handleOffline()
          } else {
            setLastOnlineAt(new Date())
          }
        })
      } else {
        setLastOfflineAt(new Date())
      }
    }

    // Event listeners for online/offline
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection change listener (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', updateConnectionType)
    }

    // Periodic connectivity check
    let intervalId: NodeJS.Timeout | null = null
    
    if (pingInterval > 0) {
      intervalId = setInterval(async () => {
        // Only ping if we think we're online but want to verify
        if (navigator.onLine) {
          const pingResult = await ping()
          if (!pingResult && isOnline) {
            handleOffline()
          } else if (pingResult && !isOnline) {
            handleOnline()
          }
        }
      }, pingInterval)
    }

    // Page visibility change - check connectivity when page becomes visible
    const handleVisibilityChange = async () => {
      if (!document.hidden && navigator.onLine) {
        const pingResult = await ping()
        if (pingResult && !isOnline) {
          handleOnline()
        } else if (!pingResult && isOnline) {
          handleOffline()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection?.removeEventListener('change', updateConnectionType)
      }
      
      if (intervalId) {
        clearInterval(intervalId)
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOnline, pingInterval, checkOnMount])

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineAt,
    lastOfflineAt,
    connectionType,
    ping,
    retryConnection
  }
}

// Hook for showing offline banner
export function useOfflineBanner() {
  const { isOnline, retryConnection } = useOnlineStatus()
  const [showBanner, setShowBanner] = useState(false)
  const [hasBeenOffline, setHasBeenOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true)
      setShowBanner(true)
    } else if (hasBeenOffline) {
      // Show "back online" banner briefly
      setShowBanner(true)
      const timer = setTimeout(() => setShowBanner(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, hasBeenOffline])

  const dismissBanner = () => setShowBanner(false)

  return {
    showBanner,
    isOnline,
    retryConnection,
    dismissBanner
  }
}

// Network information hook
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }>({})

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setNetworkInfo({
          effectiveType: connection?.effectiveType,
          downlink: connection?.downlink,
          rtt: connection?.rtt,
          saveData: connection?.saveData
        })
      }
    }

    updateNetworkInfo()

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', updateNetworkInfo)
      
      return () => {
        connection?.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}