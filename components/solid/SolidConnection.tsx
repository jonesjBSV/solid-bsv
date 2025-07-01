'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Link, LogOut, Shield, User, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSolidAuth } from '@/hooks/useSolidAuth'

const POPULAR_PROVIDERS = [
  { name: 'Inrupt Pod Spaces', url: 'https://login.inrupt.com' },
  { name: 'solidcommunity.net', url: 'https://solidcommunity.net' },
  { name: 'solidweb.org', url: 'https://solidweb.org' },
  { name: 'Custom Provider', url: 'custom' },
]

export function SolidConnection() {
  const [selectedProvider, setSelectedProvider] = useState('')
  const [customProvider, setCustomProvider] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()
  const { profile, isLoading, login, logout, error } = useSolidAuth()

  const handleConnect = async () => {
    if (!selectedProvider || (selectedProvider === 'custom' && !customProvider)) {
      toast({
        title: 'Provider Required',
        description: 'Please select or enter a SOLID provider',
        variant: 'destructive',
      })
      return
    }

    setIsConnecting(true)
    try {
      const provider = selectedProvider === 'custom' ? customProvider : selectedProvider
      await login(provider)
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to SOLID pod',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from your SOLID pod',
      })
    } catch (error) {
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (profile) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                SOLID Pod Connected
              </CardTitle>
              <CardDescription>
                Your data is stored in your personal SOLID pod
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100">
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">WebID:</span>
              <a
                href={profile.webId}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {profile.webId}
                <Link className="h-3 w-3" />
              </a>
            </div>
            
            {profile.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{profile.name}</span>
              </div>
            )}
            
            {profile.podUrl && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pod URL:</span>
                <a
                  href={profile.podUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {profile.podUrl}
                  <Link className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your data remains in your SOLID pod under your complete control. 
              BSV blockchain is used only for timestamping and micropayments.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect Pod
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Connect Your SOLID Pod
        </CardTitle>
        <CardDescription>
          Store your data in a personal SOLID pod for complete data sovereignty
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="provider">SOLID Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select a SOLID provider" />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_PROVIDERS.map((provider) => (
                <SelectItem key={provider.url} value={provider.url}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProvider === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-provider">Custom Provider URL</Label>
            <Input
              id="custom-provider"
              type="url"
              placeholder="https://your-solid-provider.com"
              value={customProvider}
              onChange={(e) => setCustomProvider(e.target.value)}
            />
          </div>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            SOLID pods provide decentralized data storage where you control your data. 
            Learn more at{' '}
            <a
              href="https://solidproject.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              solidproject.org
            </a>
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleConnect}
          disabled={isConnecting || (!selectedProvider || (selectedProvider === 'custom' && !customProvider))}
          className="w-full"
        >
          {isConnecting ? (
            <>Connecting...</>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Connect to SOLID Pod
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}