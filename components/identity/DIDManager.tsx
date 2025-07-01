'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  User,
  Shield,
  Key,
  Globe,
  CheckCircle,
  Copy,
  Download,
  Upload,
  AlertCircle,
  Link,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBSVWallet } from '@/hooks/useBSVWallet'
import { useSolidAuth } from '@/hooks/useSolidAuth'
import { IdentityService, type DIDDocument } from '@/lib/bsv/identity-service'
import { NotarizationButton } from '@/components/bsv/NotarizationButton'

export function DIDManager() {
  const [didDocument, setDIDDocument] = useState<DIDDocument | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState('')
  const { toast } = useToast()
  const { wallet, isConnected } = useBSVWallet()
  const { session } = useSolidAuth()

  // Load existing DID from storage
  useEffect(() => {
    const loadDID = async () => {
      try {
        const storedDID = localStorage.getItem('bsv_did_document')
        if (storedDID) {
          setDIDDocument(JSON.parse(storedDID))
        }
      } catch (error) {
        console.error('Failed to load DID:', error)
      }
    }
    loadDID()
  }, [])

  const handleCreateDID = async () => {
    if (!wallet || !isConnected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your BSV wallet first',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)
    try {
      const identityService = new IdentityService({
        method: 'bsv',
        network: 'mainnet',
      })

      // Create DID with wallet public key
      const newDID = await identityService.createDID({
        publicKey: wallet.getIdentityKey(),
        solidWebId: session?.webId,
        services: [
          {
            id: '#pod-service',
            type: 'SolidPodService',
            serviceEndpoint: session?.webId || '',
          },
        ],
      })

      // Timestamp on BSV
      const timestampedDID = await identityService.timestampDID(newDID)

      // Store locally
      localStorage.setItem('bsv_did_document', JSON.stringify(timestampedDID))
      setDIDDocument(timestampedDID)

      toast({
        title: 'DID Created',
        description: 'Your decentralized identity has been created and timestamped on BSV',
      })
    } catch (error) {
      toast({
        title: 'DID Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create DID',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleLinkWebID = async () => {
    if (!didDocument || !session?.webId) {
      return
    }

    setIsLinking(true)
    try {
      const identityService = new IdentityService({
        method: 'bsv',
        network: 'mainnet',
      })

      const result = await identityService.linkWebIDToDID({
        solidWebId: session.webId,
        bsvDID: didDocument.id,
        publicKey: didDocument.publicKey[0],
      })

      if (result.success) {
        toast({
          title: 'WebID Linked',
          description: 'Your SOLID WebID has been linked to your BSV DID',
        })

        // Update DID document
        const updatedDID = {
          ...didDocument,
          solidWebId: session.webId,
        }
        setDIDDocument(updatedDID)
        localStorage.setItem('bsv_did_document', JSON.stringify(updatedDID))
      }
    } catch (error) {
      toast({
        title: 'Linking Failed',
        description: 'Failed to link WebID to DID',
        variant: 'destructive',
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleExportDID = () => {
    if (!didDocument) return

    const identityService = new IdentityService({
      method: 'bsv',
      network: 'mainnet',
    })

    const jsonld = identityService.exportDIDAsJSONLD(didDocument)
    const blob = new Blob([jsonld], { type: 'application/ld+json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${didDocument.id.replace(/:/g, '_')}.jsonld`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'DID Exported',
      description: 'Your DID document has been exported as JSON-LD',
    })
  }

  const handleImportDID = async () => {
    try {
      const identityService = new IdentityService({
        method: 'bsv',
        network: 'mainnet',
      })

      const imported = identityService.importDIDFromJSONLD(importData)
      
      // Verify it's a valid DID
      if (!imported.id || !imported.publicKey) {
        throw new Error('Invalid DID document')
      }

      setDIDDocument(imported)
      localStorage.setItem('bsv_did_document', JSON.stringify(imported))
      
      toast({
        title: 'DID Imported',
        description: 'DID document imported successfully',
      })
      
      setShowImportDialog(false)
      setImportData('')
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Invalid DID document format',
        variant: 'destructive',
      })
    }
  }

  const copyDID = () => {
    if (didDocument) {
      navigator.clipboard.writeText(didDocument.id)
      toast({
        title: 'DID Copied',
        description: 'DID copied to clipboard',
      })
    }
  }

  if (!didDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Decentralized Identity (DID)
          </CardTitle>
          <CardDescription>
            Create your BSV-based decentralized identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              A DID (Decentralized Identifier) gives you a self-sovereign identity on the BSV blockchain.
              Link it with your SOLID WebID for cross-platform identity verification.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={handleCreateDID}
              disabled={!isConnected || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create New DID'}
            </Button>
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import DID Document</DialogTitle>
                  <DialogDescription>
                    Paste your DID document in JSON-LD format
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <textarea
                    className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                    placeholder='{"@context": ["https://www.w3.org/ns/did/v1"], ...}'
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                  />
                  <Button onClick={handleImportDID} className="w-full">
                    Import DID
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {!isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your BSV wallet to create a DID
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Decentralized Identity
            </CardTitle>
            <CardDescription>
              Manage your BSV DID and verifiable credentials
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>DID Identifier</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    {didDocument.id}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyDID}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Public Key</Label>
                <code className="block p-2 bg-muted rounded text-sm mt-1">
                  {didDocument.publicKey[0].slice(0, 32)}...
                </code>
              </div>

              {didDocument.bsvTimestamp && (
                <div>
                  <Label>BSV Timestamp</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      TX: {didDocument.bsvTimestamp.txHash.slice(0, 16)}...
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(didDocument.bsvTimestamp.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {didDocument.solidWebId && (
                <div>
                  <Label>Linked SOLID WebID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={didDocument.solidWebId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {didDocument.solidWebId}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportDID}>
                <Download className="h-4 w-4 mr-2" />
                Export DID
              </Button>
              {!didDocument.solidWebId && session?.webId && (
                <Button
                  variant="outline"
                  onClick={handleLinkWebID}
                  disabled={isLinking}
                >
                  <Link className="h-4 w-4 mr-2" />
                  {isLinking ? 'Linking...' : 'Link WebID'}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="space-y-3">
              {didDocument.service.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{service.type}</h4>
                      <Badge variant="outline">{service.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <code className="text-sm text-muted-foreground">
                      {service.serviceEndpoint}
                    </code>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                Services define how others can interact with your identity.
                Your SOLID pod is registered as a service endpoint.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Verifiable Credentials allow you to prove claims about your identity.
                Upload credentials issued by trusted parties.
              </AlertDescription>
            </Alert>

            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No credentials uploaded yet</p>
              <Button variant="outline" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Upload Credential
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}