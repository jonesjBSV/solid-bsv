'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  File,
  Calendar,
  Hash,
  Tag,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

const metadataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  license: z.string().optional(),
  language: z.string().optional(),
})

type MetadataFormValues = z.infer<typeof metadataSchema>

interface ResourceMetadata {
  url: string
  title: string
  description?: string
  tags: string[]
  category?: string
  license?: string
  language?: string
  contentType?: string
  size?: number
  created?: Date
  modified?: Date
  contentHash?: string
}

interface PodResource {
  url: string
  name: string
  type: 'file' | 'container'
  size?: number
  modified?: Date
  contentType?: string
}

interface PodResourceMetadataProps {
  isOpen: boolean
  onClose: () => void
  resource: PodResource | null
  onMetadataUpdate?: (metadata: ResourceMetadata) => void
}

export function PodResourceMetadata({
  isOpen,
  onClose,
  resource,
  onMetadataUpdate,
}: PodResourceMetadataProps) {
  const [metadata, setMetadata] = useState<ResourceMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const { toast } = useToast()

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      category: '',
      license: '',
      language: '',
    },
  })

  useEffect(() => {
    if (resource && isOpen) {
      loadMetadata()
    }
  }, [resource, isOpen])

  const loadMetadata = async () => {
    if (!resource) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/solid/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceUrl: resource.url }),
      })

      if (!response.ok) {
        throw new Error('Failed to load metadata')
      }

      const data = await response.json()
      const resourceMetadata: ResourceMetadata = {
        url: resource.url,
        title: data.title || resource.name,
        description: data.description || '',
        tags: data.tags || [],
        category: data.category || '',
        license: data.license || '',
        language: data.language || '',
        contentType: resource.contentType,
        size: resource.size,
        modified: resource.modified,
        created: data.created ? new Date(data.created) : undefined,
        contentHash: data.contentHash,
      }

      setMetadata(resourceMetadata)
      form.reset({
        title: resourceMetadata.title,
        description: resourceMetadata.description || '',
        tags: resourceMetadata.tags,
        category: resourceMetadata.category || '',
        license: resourceMetadata.license || '',
        language: resourceMetadata.language || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metadata')
    } finally {
      setIsLoading(false)
    }
  }

  const saveMetadata = async (values: MetadataFormValues) => {
    if (!resource || !metadata) return

    setIsSaving(true)
    setError(null)

    try {
      const updatedMetadata: ResourceMetadata = {
        ...metadata,
        ...values,
      }

      const response = await fetch('/api/solid/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceUrl: resource.url,
          metadata: updatedMetadata,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save metadata')
      }

      setMetadata(updatedMetadata)
      
      if (onMetadataUpdate) {
        onMetadataUpdate(updatedMetadata)
      }

      toast({
        title: 'Success',
        description: 'Metadata saved successfully',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metadata')
      toast({
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Failed to save metadata',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addTag = () => {
    if (!newTag.trim()) return
    
    const currentTags = form.getValues('tags') || []
    if (!currentTags.includes(newTag.trim())) {
      form.setValue('tags', [...currentTags, newTag.trim()])
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (!resource) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Resource Metadata
          </DialogTitle>
          <DialogDescription>
            View and edit metadata for {resource.name}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="properties" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="technical">Technical Info</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(saveMetadata)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter resource title"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        A human-readable title for this resource
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this resource..."
                          rows={3}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of the resource content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTag}
                      disabled={isLoading || !newTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.watch('tags') || []).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeTag(tag)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={isLoading}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., en, es, fr"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isLoading}>
                            <SelectValue placeholder="Select license" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cc0">CC0 (Public Domain)</SelectItem>
                          <SelectItem value="cc-by">CC BY</SelectItem>
                          <SelectItem value="cc-by-sa">CC BY-SA</SelectItem>
                          <SelectItem value="cc-by-nc">CC BY-NC</SelectItem>
                          <SelectItem value="mit">MIT</SelectItem>
                          <SelectItem value="gpl">GPL</SelectItem>
                          <SelectItem value="proprietary">Proprietary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Metadata'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Information</CardTitle>
                <CardDescription>
                  System-generated metadata about this resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">URL</TableCell>
                      <TableCell className="font-mono text-sm break-all">
                        {resource.url}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Content Type</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {resource.contentType || 'Unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">File Size</TableCell>
                      <TableCell>{formatFileSize(resource.size)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Last Modified</TableCell>
                      <TableCell>
                        {resource.modified
                          ? formatDistanceToNow(resource.modified, { addSuffix: true })
                          : 'Unknown'}
                      </TableCell>
                    </TableRow>
                    {metadata?.created && (
                      <TableRow>
                        <TableCell className="font-medium">Created</TableCell>
                        <TableCell>
                          {formatDistanceToNow(metadata.created, { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    )}
                    {metadata?.contentHash && (
                      <TableRow>
                        <TableCell className="font-medium">Content Hash</TableCell>
                        <TableCell className="font-mono text-sm break-all">
                          {metadata.contentHash}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}