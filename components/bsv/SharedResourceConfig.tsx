'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Share2, 
  Lock, 
  Globe, 
  Bitcoin, 
  Settings, 
  Users, 
  BarChart,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBSVWallet } from '@/hooks/useBSVWallet'

interface SharedResourceConfigProps {
  resourceId: string
  resourceType: 'pod_resource' | 'context_entry'
  title: string
  description?: string
  currentStatus?: 'private' | 'shared' | 'public'
  currentPrice?: number
  currentAccessType?: 'single' | 'time-based' | 'unlimited'
  onConfigUpdate?: (config: SharedResourceConfig) => void
}

export interface SharedResourceConfig {
  resourceId: string
  isShared: boolean
  priceSatoshis: number
  accessType: 'single' | 'time-based' | 'unlimited'
  overlayTopic: string
  accessPolicy: {
    type: 'micropayment' | 'whitelist' | 'public'
    whitelistedUsers?: string[]
  }
}

export function SharedResourceConfig({
  resourceId,
  resourceType,
  title,
  description,
  currentStatus = 'private',
  currentPrice = 1000,
  currentAccessType = 'single',
  onConfigUpdate,
}: SharedResourceConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isShared, setIsShared] = useState(currentStatus !== 'private')
  const [priceSatoshis, setPriceSatoshis] = useState(currentPrice)
  const [accessType, setAccessType] = useState<'single' | 'time-based' | 'unlimited'>(currentAccessType)
  const [overlayTopic, setOverlayTopic] = useState('')
  const [accessPolicy, setAccessPolicy] = useState<'micropayment' | 'whitelist' | 'public'>('micropayment')
  const [whitelistedUsers, setWhitelistedUsers] = useState<string[]>([])
  const [newWhitelistUser, setNewWhitelistUser] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { wallet, isConnected } = useBSVWallet()

  const formatPrice = (satoshis: number) => {
    const bsv = satoshis / 100000000
    return `${bsv.toFixed(8)} BSV`
  }

  const getOverlayTopics = () => {
    const topics = [`tm_${resourceType}`]
    if (resourceType === 'context_entry') {
      topics.push('tm_context_general', 'tm_context_public')
    } else {
      topics.push('tm_pod_resource', 'tm_pod_public')
    }
    topics.push('micropayment_offers')
    return topics
  }

  const handleAddWhitelistUser = () => {
    if (newWhitelistUser && !whitelistedUsers.includes(newWhitelistUser)) {
      setWhitelistedUsers([...whitelistedUsers, newWhitelistUser])
      setNewWhitelistUser('')
    }
  }

  const handleRemoveWhitelistUser = (user: string) => {
    setWhitelistedUsers(whitelistedUsers.filter(u => u !== user))
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    
    try {
      const config: SharedResourceConfig = {
        resourceId,
        isShared,
        priceSatoshis: isShared && accessPolicy === 'micropayment' ? priceSatoshis : 0,
        accessType,
        overlayTopic: overlayTopic || getOverlayTopics()[0],
        accessPolicy: {
          type: accessPolicy,
          whitelistedUsers: accessPolicy === 'whitelist' ? whitelistedUsers : undefined,
        },
      }

      // Call the update callback
      if (onConfigUpdate) {
        await onConfigUpdate(config)
      }

      toast({
        title: 'Configuration Saved',
        description: isShared 
          ? `Resource is now ${accessPolicy === 'public' ? 'public' : 'shared'}` 
          : 'Resource is now private',
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: 'Configuration Failed',
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const generateShareLink = () => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${resourceType}/${resourceId}`
    
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'Share Link Copied',
      description: 'The share link has been copied to your clipboard',
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        {currentStatus === 'private' ? (
          <>
            <Lock className="h-4 w-4" />
            Private
          </>
        ) : currentStatus === 'public' ? (
          <>
            <Globe className="h-4 w-4" />
            Public
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Shared
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sharing Configuration
            </DialogTitle>
            <DialogDescription>
              Configure how this resource is shared and monetized
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium">{title}</h4>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isShared"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isShared">Enable sharing for this resource</Label>
            </div>

            {isShared && (
              <Tabs value={accessPolicy} onValueChange={(v: any) => setAccessPolicy(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="micropayment">
                    <Bitcoin className="h-4 w-4 mr-2" />
                    Paid Access
                  </TabsTrigger>
                  <TabsTrigger value="whitelist">
                    <Users className="h-4 w-4 mr-2" />
                    Whitelist
                  </TabsTrigger>
                  <TabsTrigger value="public">
                    <Globe className="h-4 w-4 mr-2" />
                    Public
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="micropayment" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Price (satoshis)</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={priceSatoshis}
                          onChange={(e) => setPriceSatoshis(parseInt(e.target.value) || 0)}
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground">
                          = {formatPrice(priceSatoshis)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>Access Type</Label>
                      <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Access</SelectItem>
                          <SelectItem value="time-based">24-Hour Access</SelectItem>
                          <SelectItem value="unlimited">Unlimited Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!isConnected && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Connect your BSV wallet to receive payments. Your identity key will be 
                        used for BRC-29 payment delivery.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="whitelist" className="space-y-4">
                  <div>
                    <Label>Whitelisted Users</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter BSV address or identity key"
                          value={newWhitelistUser}
                          onChange={(e) => setNewWhitelistUser(e.target.value)}
                        />
                        <Button onClick={handleAddWhitelistUser}>Add</Button>
                      </div>
                      {whitelistedUsers.length > 0 && (
                        <div className="space-y-1">
                          {whitelistedUsers.map((user) => (
                            <div key={user} className="flex items-center justify-between p-2 rounded bg-muted">
                              <code className="text-sm">{user.slice(0, 20)}...</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveWhitelistUser(user)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="public" className="space-y-4">
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      This resource will be publicly accessible without payment. It will be 
                      discoverable on the BSV overlay network.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            )}

            {isShared && (
              <div>
                <Label>Overlay Topic</Label>
                <Select 
                  value={overlayTopic} 
                  onValueChange={setOverlayTopic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select overlay topic for discovery" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOverlayTopics().map(topic => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              {isShared && currentStatus !== 'private' && (
                <Button
                  variant="outline"
                  onClick={generateShareLink}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              )}
              <Button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}