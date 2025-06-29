'use client'

/**
 * Pod Resource Form Component
 * Form for creating and editing SOLID pod resources
 */

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFields } from './FormField'
import { validate } from '@/lib/database/validation'
import { PodResource, InsertPodResource } from '@/lib/database/types'
import { Loader2, Save, Plus } from 'lucide-react'

// Form Schema
const podResourceSchema = z.object({
  resource_path: z.string()
    .min(1, 'Resource path is required')
    .max(1000, 'Resource path too long')
    .refine((path) => !path.includes('..'), 'Invalid path characters'),
    
  resource_type: z.enum(['note', 'document', 'context', 'file'], {
    errorMap: () => ({ message: 'Please select a resource type' })
  }),
  
  status: z.enum(['private', 'shared', 'notarized', 'public'], {
    errorMap: () => ({ message: 'Please select a status' })
  }),
  
  description: z.string()
    .max(1000, 'Description too long')
    .optional()
    .or(z.literal('')),
    
  mime_type: z.string()
    .max(255, 'MIME type too long')
    .optional()
    .or(z.literal('')),
    
  resource_size: z.number()
    .positive('Size must be positive')
    .optional()
    .or(z.literal(''))
})

export type PodResourceFormData = z.infer<typeof podResourceSchema>

interface PodResourceFormProps {
  initialData?: Partial<PodResource>
  onSubmit: (data: PodResourceFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function PodResourceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: PodResourceFormProps) {
  console.log('PodResourceForm rendered with mode:', mode, 'initialData:', initialData)

  const form = useForm<PodResourceFormData>({
    resolver: zodResolver(podResourceSchema),
    defaultValues: {
      resource_path: initialData?.resource_path || '',
      resource_type: initialData?.resource_type as any || 'note',
      status: initialData?.status as any || 'private',
      description: initialData?.description || '',
      mime_type: initialData?.mime_type || '',
      resource_size: initialData?.resource_size || undefined
    }
  })

  const handleSubmit = async (data: PodResourceFormData) => {
    console.log('Pod resource form submitted:', data)
    
    try {
      await onSubmit(data)
      
      if (mode === 'create') {
        form.reset()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // Error handling is done in the parent component
    }
  }

  const resourceTypeOptions = [
    { value: 'note', label: 'Note' },
    { value: 'document', label: 'Document' },
    { value: 'context', label: 'Context Entry' },
    { value: 'file', label: 'File' }
  ]

  const statusOptions = [
    { value: 'private', label: 'Private' },
    { value: 'shared', label: 'Shared' },
    { value: 'notarized', label: 'Notarized (BSV)' },
    { value: 'public', label: 'Public' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {mode === 'create' ? 'Add Pod Resource' : 'Edit Pod Resource'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Create a new resource in your SOLID pod'
            : 'Update the pod resource information'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFields.Text
                form={form}
                name="resource_path"
                label="Resource Path"
                placeholder="/notes/my-note.md"
                description="Path to the resource in your SOLID pod"
                required
              />
              
              <FormFields.Select
                form={form}
                name="resource_type"
                label="Resource Type"
                placeholder="Select resource type"
                options={resourceTypeOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFields.Select
                form={form}
                name="status"
                label="Privacy Status"
                placeholder="Select status"
                options={statusOptions}
                description="Controls who can access this resource"
                required
              />
              
              <FormFields.Text
                form={form}
                name="mime_type"
                label="MIME Type"
                placeholder="text/markdown"
                description="Optional: specify the content type"
              />
            </div>

            <FormFields.Textarea
              form={form}
              name="description"
              label="Description"
              placeholder="Describe what this resource contains..."
              description="Optional description of the resource content"
              rows={3}
              maxLength={1000}
            />

            <FormFields.Text
              form={form}
              name="resource_size"
              label="Resource Size (bytes)"
              type="number"
              placeholder="1024"
              description="Optional: size of the resource in bytes"
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
                {mode === 'create' ? 'Create Resource' : 'Update Resource'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Validation helper
export function validatePodResourceForm(data: unknown): data is PodResourceFormData {
  const result = podResourceSchema.safeParse(data)
  if (!result.success) {
    console.error('Pod resource validation failed:', result.error)
    return false
  }
  return true
}