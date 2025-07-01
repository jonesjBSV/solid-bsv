'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shield, Clock, CheckCircle, AlertCircle, Bitcoin, Globe, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBSVWallet } from '@/hooks/useBSVWallet'
import { NotarizationService, type NotarizationRequest } from '@/lib/bsv/notarization-service'
import { ProtoWallet } from '@/lib/bsv/proto-wallet'

interface NotarizationButtonProps {
  resourceId: string
  resourceType: 'pod_resource' | 'context_entry'
  contentHash: string
  title: string
  description?: string
  onNotarizationSuccess?: (result: any) => void
  disabled?: boolean
  isNotarized?: boolean
  existingTxid?: string
}

export function NotarizationButton({
  resourceId,
  resourceType,
  contentHash,
  title,
  description,
  onNotarizationSuccess,
  disabled = false,
  isNotarized = false,
  existingTxid,
}: NotarizationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [overlayTopic, setOverlayTopic] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'direct' | 'overlay'>('direct')
  const [makePublic, setMakePublic] = useState(false)
  const { toast } = useToast()
  const { wallet, isConnected } = useBSVWallet()

  const getOverlayTopics = () => {
    return NotarizationService.getOverlayTopics(resourceType, makePublic)
  }

  const handleNotarization = async () => {
    setIsProcessing(true)
    
    try {
      // Initialize notarization service
      const appWallet = new ProtoWallet({ network: 'mainnet' })
      const notarizationService = new NotarizationService(appWallet, wallet || undefined)

      // Determine overlay topic
      const topics = getOverlayTopics()
      const selectedTopic = overlayTopic || topics[0] || 'tm_notarization'

      const request: NotarizationRequest = {
        resourceId,
        resourceType,
        contentHash,
        metadata: {
          title,
          description,
          author: wallet?.address || 'anonymous'
        },
        overlayTopic: deliveryMethod === 'overlay' ? selectedTopic : undefined,
        deliveryMethod
      }

      // Process the notarization
      const result = await notarizationService.notarizeResource(request)
      
      toast({
        title: 'Notarization Successful',
        description: `Resource notarized on BSV blockchain. TX: ${result.txid.slice(0, 16)}...`,
      })

      // Call success callback
      if (onNotarizationSuccess) {
        onNotarizationSuccess(result)
      }

      setIsOpen(false)

    } catch (error) {
      console.error('Notarization failed:', error)
      toast({
        title: 'Notarization Failed',
        description: error instanceof Error ? error.message : 'Notarization processing failed',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyNotarization = async () => {
    if (!existingTxid) return

    try {
      const appWallet = new ProtoWallet({ network: 'mainnet' })
      const notarizationService = new NotarizationService(appWallet)
      
      const isValid = await notarizationService.verifyNotarization(existingTxid, contentHash)
      
      toast({
        title: isValid ? 'Verification Successful' : 'Verification Failed',
        description: isValid 
          ? 'Notarization verified on BSV blockchain'
          : 'Could not verify notarization',
        variant: isValid ? 'default' : 'destructive',
      })

    } catch (error) {
      toast({
        title: 'Verification Error',
        description: 'Failed to verify notarization',
        variant: 'destructive',
      })
    }
  }

  if (isNotarized && existingTxid) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleVerifyNotarization}
        >
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Verify Notarization
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          TX: {existingTxid.slice(0, 16)}...{existingTxid.slice(-8)}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          disabled={disabled}
        >
          <Shield className="h-4 w-4 mr-2" />
          Notarize on BSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            BSV Blockchain Notarization
          </DialogTitle>
          <DialogDescription>
            Create an immutable timestamp and proof of existence for this resource
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <h4 className="font-medium">{title}</h4>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <Badge variant="outline">{resourceType.replace('_', ' ')}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Content Hash:</span>
                <code className="text-xs">{contentHash.slice(0, 16)}...</code>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Delivery Method</label>
              <Select 
                value={deliveryMethod} 
                onValueChange={(value: 'direct' | 'overlay') => setDeliveryMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Direct Delivery
                    </div>
                  </SelectItem>
                  <SelectItem value="overlay">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Overlay Network
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {deliveryMethod === 'overlay' && (
              <div>
                <label className="text-sm font-medium">Overlay Topic</label>
                <Select 
                  value={overlayTopic} 
                  onValueChange={setOverlayTopic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select overlay topic" />
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="makePublic"
                checked={makePublic}
                onChange={(e) => setMakePublic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="makePublic" className="text-sm">
                Make publicly discoverable
              </label>
            </div>
          </div>

          {!isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your BSV wallet to notarize resources. App wallet will be used for free notarization service.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>BSV SPV Notarization:</strong> Creates an immutable blockchain record with 
              {deliveryMethod === 'overlay' ? ' overlay network publication for public discovery' : ' direct delivery to notary service'}.
              {isConnected ? ' You control the transaction.' : ' Free notarization provided by app.'}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNotarization}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Notarize
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}