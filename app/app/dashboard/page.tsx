'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Wallet, 
  Globe, 
  User, 
  FileText,
  Shield,
  TrendingUp,
  Database,
  Share2
} from 'lucide-react'

// SOLID Components
import { SolidConnection } from '@/components/solid/SolidConnection'
import { PodResourceBrowser } from '@/components/solid/PodResourceBrowser'
import { PodSyncStatus } from '@/components/solid/PodSyncStatus'

// BSV Components
import { WalletConnection } from '@/components/bsv/WalletConnection'
import { ResourceMarketplace } from '@/components/marketplace/ResourceMarketplace'

// Identity Components
import { DIDManager } from '@/components/identity/DIDManager'

// Context Components
import { ContextEntryForm } from '@/components/context/ContextEntryForm'

// Hooks
import { useSolidAuth } from '@/hooks/useSolidAuth'
import { useBSVWallet } from '@/hooks/useBSVWallet'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { session, isLoading: solidLoading } = useSolidAuth()
  const { isConnected: walletConnected } = useBSVWallet()
  const { toast } = useToast()

  const handleContextSubmit = async (entry: any) => {
    try {
      const response = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        throw new Error('Failed to save context entry')
      }

      toast({
        title: 'Context Entry Saved',
        description: 'Your entry has been saved to your second brain',
      })
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save context entry',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">SOLID + BSV Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your decentralized data sovereignty and blockchain features
        </p>
      </div>

      {/* Connection Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SOLID Pod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className={`h-4 w-4 ${session ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                {solidLoading ? 'Loading...' : session ? 'Connected' : 'Not connected'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">BSV Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className={`h-4 w-4 ${walletConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                {walletConnected ? 'Connected' : 'Not connected'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">DID Ready</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm">Overlay Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Brain className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pod">
            <Database className="h-4 w-4 mr-2" />
            Pod
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="identity">
            <User className="h-4 w-4 mr-2" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Globe className="h-4 w-4 mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="context">
            <FileText className="h-4 w-4 mr-2" />
            Context
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Second Brain</CardTitle>
              <CardDescription>
                A decentralized knowledge management system combining SOLID data sovereignty with BSV blockchain features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Getting Started:</strong> Connect your SOLID Pod for data storage and your BSV wallet for blockchain features.
                  Create context entries, notarize important information, and share resources with micropayments.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Sovereignty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Your data stays in your SOLID Pod
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Complete control over access permissions
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Portable across applications
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">BSV Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Blockchain notarization for proof
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Micropayments for resource access
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Decentralized identity with DIDs
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pod" className="space-y-4">
          {!session ? (
            <SolidConnection />
          ) : (
            <>
              <PodSyncStatus podUrl={session.webId} />
              <PodResourceBrowser />
            </>
          )}
        </TabsContent>

        <TabsContent value="wallet" className="space-y-4">
          <WalletConnection />
          
          {walletConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Wallet Features</CardTitle>
                <CardDescription>
                  Use your BSV wallet for blockchain operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your wallet follows BSV SPV architecture. You control your keys, 
                    the app creates transactions for your approval.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <h4 className="font-medium">Notarization</h4>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Timestamp and prove existence of your data on the blockchain
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <h4 className="font-medium">Micropayments</h4>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Pay for resource access or monetize your shared content
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="identity" className="space-y-4">
          <DIDManager />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <ResourceMarketplace />
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context Management</CardTitle>
              <CardDescription>
                Create and manage context entries in your second brain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContextEntryForm onSubmit={handleContextSubmit} />
            </CardContent>
          </Card>

          {/* Context entries list would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No context entries yet. Create your first entry above.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}