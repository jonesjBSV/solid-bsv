'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, Shield, AlertCircle, CheckCircle, Key, Bitcoin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBSVWallet } from '@/hooks/useBSVWallet'

export function WalletConnection() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()
  const { wallet, isConnected, isLoading, error, connect, disconnect, balance } = useBSVWallet()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your BSV wallet',
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast({
        title: 'Wallet Disconnected',
        description: 'Successfully disconnected from your BSV wallet',
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

  if (isConnected && wallet) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                BSV Wallet Connected
              </CardTitle>
              <CardDescription>
                Your BSV wallet is connected for micropayments and attestations
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
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Address:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {wallet.address.slice(0, 20)}...{wallet.address.slice(-8)}
              </code>
            </div>
            
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Identity Key:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {wallet.identityKey?.slice(0, 16)}...
              </code>
            </div>
            
            {balance && (
              <div className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Balance:</span>
                <span className="text-sm">
                  {(balance.confirmed / 100000000).toFixed(8)} BSV
                  {balance.unconfirmed > 0 && (
                    <span className="text-muted-foreground ml-1">
                      (+{(balance.unconfirmed / 100000000).toFixed(8)} unconfirmed)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your private keys remain secure in your wallet. The app only requests 
              transaction signatures for micropayments and blockchain attestations.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect BSV Wallet
        </CardTitle>
        <CardDescription>
          Connect your BRC-100 compatible BSV wallet for micropayments and blockchain features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>BSV SPV Architecture:</strong> You bring your own BRC-100 compatible wallet. 
            The app never creates, stores, or manages your private keys. All transactions are 
            created by the app and signed by your wallet with your explicit consent.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Supported Wallets:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• BRC-100 compatible wallets</li>
            <li>• BSV SPV wallets with BEEF support</li>
            <li>• Wallets supporting BRC-29 payments</li>
          </ul>
        </div>

        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>Connecting...</>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect BSV Wallet
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Don't have a BSV wallet? Get the metanet wallet from{' '}
          <a 
            href="https://metanet.bsvb.tech/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            Metanet Desktop
          </a>
        </div>
      </CardContent>
    </Card>
  )
}