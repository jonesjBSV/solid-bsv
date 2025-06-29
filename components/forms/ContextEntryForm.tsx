'use client'

/**
 * Context Entry Form Component
 * Form for creating and editing second brain context entries
 */

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFields } from './FormField'
import { ContextEntry } from '@/lib/database/types'
import { Loader2, Save, Plus, Brain } from 'lucide-react'

// Form Schema
const contextEntrySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title too long'),
    
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content too long'),
    
  content_type: z.enum(['text', 'markdown', 'link', 'snippet'], {
    errorMap: () => ({ message: 'Please select a content type' })
  }),
  
  tags: z.array(z.string().min(1).max(50))
    .max(20, 'Too many tags')
    .optional(),
    
  pod_resource_id: z.number()
    .positive('Invalid pod resource ID')
    .optional()
    .or(z.literal(''))
})

export type ContextEntryFormData = z.infer<typeof contextEntrySchema>

interface ContextEntryFormProps {
  initialData?: Partial<ContextEntry>
  onSubmit: (data: ContextEntryFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  availablePodResources?: Array<{ id: number; resource_path: string }>
}

export function ContextEntryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  availablePodResources = []
}: ContextEntryFormProps) {
  console.log('ContextEntryForm rendered with mode:', mode, 'initialData:', initialData)

  const form = useForm<ContextEntryFormData>({
    resolver: zodResolver(contextEntrySchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      content_type: initialData?.content_type as any || 'text',
      tags: initialData?.tags || [],
      pod_resource_id: initialData?.pod_resource_id || undefined
    }
  })

  const handleSubmit = async (data: ContextEntryFormData) => {
    console.log('Context entry form submitted:', data)
    
    try {
      // Convert empty string to undefined for pod_resource_id
      const submitData = {
        ...data,
        pod_resource_id: data.pod_resource_id === '' ? undefined : data.pod_resource_id
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

  const contentTypeOptions = [
    { value: 'text', label: 'Plain Text' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'link', label: 'Link/URL' },
    { value: 'snippet', label: 'Code Snippet' }
  ]

  const podResourceOptions = [
    { value: '', label: 'No linked resource' },
    ...availablePodResources.map(resource => ({
      value: resource.id.toString(),
      label: resource.resource_path
    }))
  ]

  const validateTag = (tag: string): string | null => {
    if (tag.length > 50) {
      return 'Tag too long (max 50 characters)'
    }
    if (!/^[a-zA-Z0-9\-_\s]+$/.test(tag)) {
      return 'Tag contains invalid characters'
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          <Brain className="h-5 w-5" />
          {mode === 'create' ? 'Add Context Entry' : 'Edit Context Entry'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new entry to your second brain knowledge base'
            : 'Update the context entry information'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFields.Text
                form={form}
                name="title"
                label="Title"
                placeholder="Enter a descriptive title..."
                description="A clear, searchable title for this entry"
                required
              />
              
              <FormFields.Select
                form={form}
                name="content_type"
                label="Content Type"
                placeholder="Select content type"
                options={contentTypeOptions}
                description="How should this content be rendered?"
                required
              />
            </div>

            <FormFields.Textarea
              form={form}
              name="content"
              label="Content"
              placeholder="Enter your content here..."
              description="The main content of your knowledge entry"
              rows={8}
              maxLength={50000}
              required
            />

            <FormFields.Tags
              form={form}
              name="tags"
              label="Tags"
              placeholder="Type a tag and press Enter..."
              description="Add tags to categorize and find this entry easily"
              maxTags={20}
              tagValidator={validateTag}
            />

            {availablePodResources.length > 0 && (
              <FormFields.Select
                form={form}
                name="pod_resource_id"
                label="Linked Pod Resource"
                placeholder="Link to a pod resource (optional)"
                options={podResourceOptions}
                description="Optionally link this entry to a resource in your SOLID pod"
              />
            )}

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
                {mode === 'create' ? 'Create Entry' : 'Update Entry'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Helper function for content type display
export function getContentTypeDisplay(contentType: string): string {
  switch (contentType) {
    case 'text': return 'Plain Text'
    case 'markdown': return 'Markdown'
    case 'link': return 'Link/URL'
    case 'snippet': return 'Code Snippet'
    default: return contentType
  }
}

// Helper function for content validation
export function validateContextContent(content: string, contentType: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!content.trim()) {
    errors.push('Content cannot be empty')
  }
  
  if (content.length > 50000) {
    errors.push('Content too long (max 50,000 characters)')
  }
  
  if (contentType === 'link') {
    try {
      new URL(content.trim())
    } catch {
      errors.push('Invalid URL format')
    }
  }
  
  if (contentType === 'markdown') {
    // Basic markdown validation
    if (content.includes('<script')) {
      errors.push('Script tags not allowed in markdown')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validation helper
export function validateContextEntryForm(data: unknown): data is ContextEntryFormData {
  const result = contextEntrySchema.safeParse(data)
  if (!result.success) {
    console.error('Context entry validation failed:', result.error)
    return false
  }
  return true
}