'use client'

import { useState, useEffect } from 'react'
import { PodConnectionForm } from '@/components/solid/PodConnectionForm'
import { PodStatus } from '@/components/solid/PodStatus'
import { PodResourceBrowser } from '@/components/solid/PodResourceBrowser'
import { PodSyncStatus } from '@/components/solid/PodSyncStatus'
import { WalletConnection } from '@/components/bsv/WalletConnection'
import { MicropaymentButton } from '@/components/bsv/MicropaymentButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, Shield, Database, Wallet, Bitcoin, Zap, Store, Brain } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBSVWallet } from '@/hooks/useBSVWallet'

export default function SolidShowcasePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [podUrl, setPodUrl] = useState<string | null>(null)
  const [webId, setWebId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { wallet: bsvWallet, isConnected: bsvConnected } = useBSVWallet()

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/solid/profile')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
        setPodUrl(data.podUrl)
        setWebId(data.webId)
      }
    } catch (error) {
      console.error('Failed to check connection status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (values: { podUrl: string; oidcIssuer?: string }) => {
    try {
      const response = await fetch('/api/solid/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to connect to pod')
      }

      const data = await response.json()
      setIsConnected(true)
      setPodUrl(values.podUrl)
      setWebId(data.webId)
      
      toast({
        title: 'Success',
        description: 'Successfully connected to your SOLID Pod',
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/solid/connect', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setIsConnected(false)
      setPodUrl(null)
      setWebId(null)
      
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from your SOLID Pod',
      })
    } catch (error) {
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        variant: 'destructive',
      })
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SOLID + BSV Showcase</h1>
        <p className="text-muted-foreground mt-2">
          Decentralized data sovereignty with blockchain micropayments
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant={isConnected ? "default" : "secondary"}>
            SOLID: {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant={bsvConnected ? "default" : "secondary"}>
            BSV: {bsvConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>SOLID + BSV Integration</AlertTitle>
        <AlertDescription>
          This showcase demonstrates how SOLID pods (decentralized data storage) can be enhanced with BSV blockchain 
          features including micropayments, notarization, and overlay networks for monetized data sharing.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pod">Pod</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="sync" disabled={!isConnected}>
            Sync
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  SOLID Pod Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Connection</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pod: {podUrl?.slice(0, 40)}...
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Not connected to a SOLID pod
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  BSV Wallet Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bsvConnected && bsvWallet ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Connection</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Address: {bsvWallet.address.slice(0, 20)}...
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No BSV wallet connected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" disabled={!isConnected}>
                  <Database className="h-4 w-4 mr-2" />
                  Browse Pod Resources
                </Button>
                <Button variant="outline" disabled={!bsvConnected}>
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Make Micropayment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pod" className="space-y-4">
          <PodConnectionForm
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={isConnected}
            currentPodUrl={podUrl || undefined}
          />
          
          {webId && (
            <PodStatus
              webId={webId}
              isConnected={isConnected}
            />
          )}
          
          {podUrl && (
            <PodResourceBrowser
              podUrl={podUrl}
              onResourceSelect={(resource) => {
                console.log('Selected resource:', resource)
              }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="wallet" className="space-y-4">
          <WalletConnection />
          
          {bsvConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5" />
                  Micropayment Demo
                </CardTitle>
                <CardDescription>
                  Test BSV micropayments for resource access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Demo Resource Access</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Premium data analysis report with market insights
                    </p>
                    <MicropaymentButton
                      resourceId="demo-resource-001"
                      title="Premium Market Analysis"
                      description="Detailed market insights and trends"
                      priceSatoshis={1000}
                      accessType="single"
                      recipientIdentityKey="demo-recipient-key"
                      onPaymentSuccess={(result) => {
                        toast({
                          title: 'Payment Demo Complete',
                          description: `Transaction: ${result.txid.slice(0, 16)}...`,
                        })
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Data Marketplace
              </CardTitle>
              <CardDescription>
                Discover and access monetized SOLID pod resources with BSV micropayments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Browse Resources</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Discover valuable content shared by the community with instant BSV payments
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/app/marketplace">
                        <Store className="h-4 w-4 mr-2" />
                        Browse Marketplace
                      </a>
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sell Your Content</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Monetize your knowledge and resources with pay-per-access pricing
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/app/context">
                        <Bitcoin className="h-4 w-4 mr-2" />
                        Share & Earn
                      </a>
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The marketplace uses BSV micropayments for instant, low-cost access to premium content. 
                    Your purchases are verified using SPV technology without requiring full blockchain downloads.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <PodSyncStatus
            podUrl={podUrl || ''}
            isConnected={isConnected}
          />
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Second Brain Context Store
              </CardTitle>
              <CardDescription>
                Your personal knowledge base with AI enhancement and BSV monetization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Knowledge Entries</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Store and organize your thoughts, insights, and knowledge with rich categorization
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/app/context">
                        <Brain className="h-4 w-4 mr-2" />
                        Manage Context
                      </a>
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">AI Enhancement</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get AI-powered suggestions for tags, relationships, and content improvements
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      <Zap className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your context entries are stored in your SOLID pod for complete data sovereignty. 
                    Share valuable insights with BSV micropayments for monetized knowledge exchange.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Usage Analytics
              </CardTitle>
              <CardDescription>
                Track your SOLID pod usage and BSV transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Monitor earnings, usage patterns, and content performance
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/app/analytics">
                        <Shield className="h-4 w-4 mr-2" />
                        View Analytics
                      </a>
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">BSV Blockchain Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track notarizations, transaction fees, and blockchain performance
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/app/analytics">
                        <Bitcoin className="h-4 w-4 mr-2" />
                        Blockchain Stats
                      </a>
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Analytics track your content performance, earnings from shared resources, 
                    and BSV blockchain activity including notarizations and micropayments.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}