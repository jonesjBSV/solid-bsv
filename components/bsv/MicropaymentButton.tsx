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
import { Bitcoin, Lock, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBSVWallet } from '@/hooks/useBSVWallet'
import { MicropaymentService, type MicropaymentRequest } from '@/lib/bsv/micropayment-service'
import { ProtoWallet } from '@/lib/bsv/proto-wallet'

interface MicropaymentButtonProps {
  resourceId: string
  title: string
  description: string
  priceSatoshis: number
  accessType: 'single' | 'time-based' | 'unlimited'
  recipientIdentityKey: string
  onPaymentSuccess?: (result: any) => void
  disabled?: boolean
}

export function MicropaymentButton({
  resourceId,
  title,
  description,
  priceSatoshis,
  accessType,
  recipientIdentityKey,
  onPaymentSuccess,
  disabled = false,
}: MicropaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const { toast } = useToast()
  const { wallet, isConnected } = useBSVWallet()

  const formatPrice = (satoshis: number) => {
    const bsv = satoshis / 100000000
    return `${bsv.toFixed(8)} BSV (${satoshis.toLocaleString()} sats)`
  }

  const getAccessTypeDescription = () => {
    switch (accessType) {
      case 'single':
        return 'One-time access'
      case 'time-based':
        return '24-hour access'
      case 'unlimited':
        return 'Unlimited access'
      default:
        return 'Access'
    }
  }

  const getAccessIcon = () => {
    switch (accessType) {
      case 'single':
        return <Lock className="h-4 w-4" />
      case 'time-based':
        return <Clock className="h-4 w-4" />
      case 'unlimited':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const handlePayment = async () => {
    if (!wallet || !isConnected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your BSV wallet first',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Initialize micropayment service with user wallet and app wallet
      const appWallet = new ProtoWallet({ network: 'mainnet' })
      const micropaymentService = new MicropaymentService(wallet, appWallet)

      const request: MicropaymentRequest = {
        resourceId,
        priceSatoshis,
        accessType,
        description: `Access to: ${title}`,
        recipientIdentityKey,
      }

      // Process the micropayment
      const result = await micropaymentService.processPayment(request)
      
      setPaymentResult(result)
      
      toast({
        title: 'Payment Successful',
        description: `Access granted to "${title}"`,
      })

      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(result)
      }

    } catch (error) {
      console.error('Payment failed:', error)
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Payment processing failed',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentResult) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          disabled
        >
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Access Granted
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          TX: {paymentResult.txid.slice(0, 16)}...
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full"
          disabled={disabled || !isConnected}
        >
          <Bitcoin className="h-4 w-4 mr-2" />
          Pay {formatPrice(priceSatoshis).split(' ')[0]}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Micropayment
          </DialogTitle>
          <DialogDescription>
            Pay for access to this resource using BSV
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getAccessIcon()}
                <span className="text-sm font-medium">{getAccessTypeDescription()}</span>
              </div>
              <Badge variant="outline">
                {formatPrice(priceSatoshis)}
              </Badge>
            </div>
          </div>

          {!isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your BSV wallet to make payments
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Bitcoin className="h-4 w-4" />
            <AlertDescription>
              <strong>BSV SPV Payment:</strong> Your transaction will be created and signed 
              by your wallet, then delivered directly to the resource owner using BEEF format 
              for instant verification.
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
              onClick={handlePayment}
              disabled={!isConnected || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}