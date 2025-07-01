'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const podConnectionSchema = z.object({
  podUrl: z.string().url('Please enter a valid URL').min(1, 'Pod URL is required'),
  oidcIssuer: z.string().url('Please enter a valid OIDC issuer URL').optional(),
})

type PodConnectionFormValues = z.infer<typeof podConnectionSchema>

interface PodConnectionFormProps {
  onConnect: (values: PodConnectionFormValues) => Promise<void>
  onDisconnect?: () => Promise<void>
  isConnected?: boolean
  currentPodUrl?: string
}

export function PodConnectionForm({
  onConnect,
  onDisconnect,
  isConnected = false,
  currentPodUrl,
}: PodConnectionFormProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const { toast } = useToast()

  const form = useForm<PodConnectionFormValues>({
    resolver: zodResolver(podConnectionSchema),
    defaultValues: {
      podUrl: currentPodUrl || '',
      oidcIssuer: '',
    },
  })

  const validatePodUrl = async (url: string) => {
    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch('/api/solid/validate-pod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podUrl: url }),
      })

      const result = await response.json()
      
      setValidationResult({
        isValid: result.isValid,
        message: result.message || (result.isValid ? 'Valid SOLID Pod' : 'Invalid Pod URL'),
      })
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Failed to validate Pod URL',
      })
    } finally {
      setIsValidating(false)
    }
  }

  const onSubmit = async (values: PodConnectionFormValues) => {
    try {
      await onConnect(values)
      toast({
        title: 'Success',
        description: 'Connected to your SOLID Pod',
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to pod',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = async () => {
    if (onDisconnect) {
      try {
        await onDisconnect()
        toast({
          title: 'Disconnected',
          description: 'Disconnected from your SOLID Pod',
        })
        form.reset()
        setValidationResult(null)
      } catch (error) {
        toast({
          title: 'Disconnect Failed',
          description: error instanceof Error ? error.message : 'Failed to disconnect',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SOLID Pod Connection</CardTitle>
        <CardDescription>
          Connect your SOLID Pod to manage decentralized data and identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected && currentPodUrl ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Connected to: <strong>{currentPodUrl}</strong>
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Pod
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="podUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pod URL</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://pod.example.com"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => validatePodUrl(field.value)}
                          disabled={!field.value || isValidating}
                        >
                          {isValidating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Validate'
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the URL of your SOLID Pod
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {validationResult && (
                <Alert
                  variant={validationResult.isValid ? 'default' : 'destructive'}
                >
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{validationResult.message}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="oidcIssuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OIDC Issuer (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://solidcommunity.net"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use the pod's default OIDC provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to your pod's authentication page to authorize access
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Pod'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}