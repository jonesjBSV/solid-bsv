'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Database,
  Shield,
  AlertCircle,
} from 'lucide-react'

interface PodProfile {
  webId: string
  name?: string
  email?: string
  storage?: string[]
}

interface PodStatusProps {
  webId?: string
  isConnected: boolean
  onProfileLoad?: (profile: PodProfile) => void
}

export function PodStatus({ webId, isConnected, onProfileLoad }: PodStatusProps) {
  const [profile, setProfile] = useState<PodProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (webId && isConnected) {
      loadProfile()
    } else {
      setProfile(null)
      setError(null)
    }
  }, [webId, isConnected])

  const loadProfile = async () => {
    if (!webId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/solid/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webId }),
      })

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      setProfile(data)
      
      if (onProfileLoad) {
        onProfileLoad(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            Not Connected
          </CardTitle>
          <CardDescription>
            Connect your SOLID Pod to view your profile and manage resources
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Pod Connected
          </CardTitle>
          <Badge variant="default">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : profile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>WebID:</strong> {profile.webId}
              </span>
            </div>
            
            {profile.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Name:</strong> {profile.name}
                </span>
              </div>
            )}

            {profile.email && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Email:</strong> {profile.email}
                </span>
              </div>
            )}

            {profile.storage && profile.storage.length > 0 && (
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <strong>Storage:</strong>
                  <ul className="mt-1 space-y-1">
                    {profile.storage.map((url, index) => (
                      <li key={index} className="text-muted-foreground">
                        {url}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading profile...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}