'use client'

/**
 * Shared Resource Form Component
 * Form for creating and managing shared resources with pricing
 */

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFields } from './FormField'
import { SharedResource } from '@/lib/database/types'
import { Loader2, Save, Plus, Share2, DollarSign } from 'lucide-react'

// Form Schema
const sharedResourceSchema = z.object({
  resource_id: z.number()
    .positive('Invalid resource ID')
    .or(z.literal('')),
    
  shared_with_user_id: z.string()
    .min(1, 'User ID is required')
    .max(255, 'User ID too long')
    .optional()
    .or(z.literal('')),
    
  shared_with_public: z.boolean(),
    
  price_per_access: z.number()
    .nonnegative('Price cannot be negative')
    .max(999999.99, 'Price too high')
    .optional()
    .or(z.literal('')),
    
  price_currency: z.enum(['USD', 'BSV', 'SAT'], {
    errorMap: () => ({ message: 'Please select a currency' })
  }).optional(),
  
  access_limit: z.number()
    .positive('Access limit must be positive')
    .max(999999, 'Access limit too high')
    .optional()
    .or(z.literal('')),
    
  expiry_date: z.string()
    .optional()
    .or(z.literal('')),
    
  description: z.string()
    .max(1000, 'Description too long')
    .optional()
    .or(z.literal('')),
    
  requires_payment: z.boolean()
})

export type SharedResourceFormData = z.infer<typeof sharedResourceSchema>

interface SharedResourceFormProps {
  initialData?: Partial<SharedResource>
  onSubmit: (data: SharedResourceFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  availableResources?: Array<{ id: number; resource_path: string }>
}

export function SharedResourceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  availableResources = []
}: SharedResourceFormProps) {
  console.log('SharedResourceForm rendered with mode:', mode, 'initialData:', initialData)

  const form = useForm<SharedResourceFormData>({
    resolver: zodResolver(sharedResourceSchema),
    defaultValues: {
      resource_id: initialData?.resource_id || undefined,
      shared_with_user_id: initialData?.shared_with_user_id || '',
      shared_with_public: initialData?.shared_with_public || false,
      price_per_access: initialData?.price_per_access || undefined,
      price_currency: initialData?.price_currency as any || 'USD',
      access_limit: initialData?.access_limit || undefined,
      expiry_date: initialData?.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : '',
      description: initialData?.description || '',
      requires_payment: initialData?.requires_payment || false
    }
  })

  const watchRequiresPayment = form.watch('requires_payment')
  const watchSharedWithPublic = form.watch('shared_with_public')

  const handleSubmit = async (data: SharedResourceFormData) => {
    console.log('Shared resource form submitted:', data)
    
    try {
      // Ensure proper types for submission  
      const submitData: SharedResourceFormData = {
        resource_id: data.resource_id === '' ? '' : (typeof data.resource_id === 'string' ? parseInt(data.resource_id, 10) : data.resource_id) as number | '',
        shared_with_user_id: data.shared_with_user_id === '' ? undefined : data.shared_with_user_id,
        shared_with_public: data.shared_with_public,
        requires_payment: data.requires_payment,
        price_per_access: data.price_per_access === '' ? undefined : data.price_per_access,
        price_currency: watchRequiresPayment ? data.price_currency : undefined,
        access_limit: data.access_limit === '' ? undefined : data.access_limit,
        expiry_date: data.expiry_date === '' ? undefined : data.expiry_date,
        description: data.description === '' ? undefined : data.description
      }
      
      await onSubmit(submitData)
      
      if (mode === 'create') {
        form.reset()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // Error handling is done in the parent component
    }
  }

  const resourceOptions = availableResources.map(resource => ({
    value: resource.id.toString(),
    label: resource.resource_path
  }))

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'BSV', label: 'BSV' },
    { value: 'SAT', label: 'Satoshis' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          <Share2 className="h-5 w-5" />
          {mode === 'create' ? 'Share Resource' : 'Edit Shared Resource'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Share a resource with specific users or make it publicly available'
            : 'Update the sharing settings for this resource'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {availableResources.length > 0 && (
              <FormFields.Select
                form={form}
                name="resource_id"
                label="Resource to Share"
                placeholder="Select a resource"
                options={resourceOptions}
                description="Choose which resource you want to share"
                required
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFields.Checkbox
                form={form}
                name="shared_with_public"
                label="Share Publicly"
                description="Make this resource available to anyone"
              />
              
              <FormFields.Checkbox
                form={form}
                name="requires_payment"
                label="Require Payment"
                description="Charge for access to this resource"
              />
            </div>

            {!watchSharedWithPublic && (
              <FormFields.Text
                form={form}
                name="shared_with_user_id"
                label="Share with User"
                placeholder="user@example.com or user-id"
                description="Specific user to share with (leave empty for public)"
              />
            )}

            {watchRequiresPayment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFields.Text
                  form={form}
                  name="price_per_access"
                  label="Price per Access"
                  type="number"
                  placeholder="0.00"
                  description="Cost to access this resource"
                  required={watchRequiresPayment}
                />
                
                <FormFields.Select
                  form={form}
                  name="price_currency"
                  label="Currency"
                  placeholder="Select currency"
                  options={currencyOptions}
                  description="Payment currency"
                  required={watchRequiresPayment}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFields.Text
                form={form}
                name="access_limit"
                label="Access Limit"
                type="number"
                placeholder="100"
                description="Maximum number of times this can be accessed"
              />
              
              <FormFields.Text
                form={form}
                name="expiry_date"
                label="Expiry Date"
                type="text"
                placeholder="YYYY-MM-DD"
                description="When this sharing arrangement expires (format: YYYY-MM-DD)"
              />
            </div>

            <FormFields.Textarea
              form={form}
              name="description"
              label="Description"
              placeholder="Describe what you're sharing and any terms..."
              description="Optional description for the shared resource"
              rows={3}
              maxLength={1000}
            />

            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <DollarSign className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Share Resource' : 'Update Sharing'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Validation helper
export function validateSharedResourceForm(data: unknown): data is SharedResourceFormData {
  const result = sharedResourceSchema.safeParse(data)
  if (!result.success) {
    console.error('Shared resource validation failed:', result.error)
    return false
  }
  return true
}

// Helper function for currency display
export function formatPrice(amount: number, currency: string): string {
  switch (currency) {
    case 'USD':
      return `$${amount.toFixed(2)}`
    case 'BSV':
      return `${amount.toFixed(8)} BSV`
    case 'SAT':
      return `${Math.round(amount)} sat`
    default:
      return `${amount} ${currency}`
  }
}

// Helper function for access status
export function getAccessStatus(
  accessCount: number, 
  accessLimit?: number, 
  expiryDate?: string
): { status: 'active' | 'limited' | 'expired'; message: string } {
  const now = new Date()
  
  if (expiryDate && new Date(expiryDate) < now) {
    return { status: 'expired', message: 'Sharing has expired' }
  }
  
  if (accessLimit && accessCount >= accessLimit) {
    return { status: 'expired', message: 'Access limit reached' }
  }
  
  if (accessLimit) {
    const remaining = accessLimit - accessCount
    return { 
      status: 'limited', 
      message: `${remaining} access${remaining !== 1 ? 'es' : ''} remaining` 
    }
  }
  
  return { status: 'active', message: 'Active sharing' }
}