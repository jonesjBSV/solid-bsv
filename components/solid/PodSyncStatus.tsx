'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface SyncStatus {
  totalResources: number
  syncedResources: number
  failedResources: number
  errors: string[]
  lastSyncTime: Date
}

interface PodSyncStatusProps {
  podUrl: string
  isConnected: boolean
}

export function PodSyncStatus({ podUrl, isConnected }: PodSyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isConnected) {
      checkSyncStatus()
    }
  }, [isConnected])

  const checkSyncStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/solid/sync-status')
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data.status)
        setLastCheck(new Date())
      }
    } catch (error) {
      console.error('Failed to check sync status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const response = await fetch('/api/solid/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to start sync')
      }

      // Start polling for progress
      const progressInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch('/api/solid/sync-progress')
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            setSyncProgress(progressData.progress)
            
            if (progressData.completed) {
              clearInterval(progressInterval)
              setIsSyncing(false)
              setSyncStatus(progressData.status)
              toast({
                title: 'Sync Complete',
                description: `Synced ${progressData.status.syncedResources} resources`,
              })
            }
          }
        } catch (error) {
          console.error('Progress check error:', error)
        }
      }, 1000)

      // Cleanup interval after 5 minutes max
      setTimeout(() => {
        clearInterval(progressInterval)
        setIsSyncing(false)
      }, 300000)
    } catch (error) {
      setIsSyncing(false)
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync',
        variant: 'destructive',
      })
    }
  }

  const getSyncStatusBadge = () => {
    if (!syncStatus) {
      return <Badge variant="outline">Unknown</Badge>
    }

    if (syncStatus.failedResources > 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partial Sync
        </Badge>
      )
    }

    if (syncStatus.syncedResources > 0) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Synced
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    )
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Pod Synchronization
          </CardTitle>
          <CardDescription>
            Connect your pod to enable synchronization
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Pod Synchronization
            </CardTitle>
            <CardDescription>
              Keep your pod resources synchronized with the database
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getSyncStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={checkSyncStatus}
              disabled={isLoading || isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Progress */}
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Syncing resources...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        {/* Sync Status Summary */}
        {syncStatus && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {syncStatus.totalResources}
              </div>
              <div className="text-xs text-muted-foreground">Total Resources</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {syncStatus.syncedResources}
              </div>
              <div className="text-xs text-muted-foreground">Synced</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {syncStatus.failedResources}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
        )}

        {/* Last Sync Time */}
        {lastCheck && (
          <div className="text-sm text-muted-foreground text-center">
            Last checked: {formatDistanceToNow(lastCheck, { addSuffix: true })}
          </div>
        )}

        {/* Sync Errors */}
        {syncStatus?.errors && syncStatus.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {syncStatus.errors.length} error(s) occurred during sync.
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto ml-1">
                    View details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sync Errors</DialogTitle>
                    <DialogDescription>
                      The following errors occurred during synchronization:
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {syncStatus.errors.map((error, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Actions */}
        <div className="flex gap-2">
          <Button
            onClick={startSync}
            disabled={isSyncing || isLoading}
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-pulse" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Settings</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync Settings</DialogTitle>
                <DialogDescription>
                  Configure synchronization options
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sync settings configuration coming soon...
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}