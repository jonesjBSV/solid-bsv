'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Folder,
  File,
  Upload,
  Download,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Search,
  AlertCircle,
  FileText,
  Image,
  Video,
  Music,
  Edit3,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { PodFileUpload } from './PodFileUpload'
import { PodResourceMetadata } from './PodResourceMetadata'

interface PodResource {
  url: string
  name: string
  type: 'file' | 'container'
  size?: number
  modified?: Date
  contentType?: string
}

interface PodResourceBrowserProps {
  podUrl: string
  onResourceSelect?: (resource: PodResource) => void
}

export function PodResourceBrowser({ podUrl, onResourceSelect }: PodResourceBrowserProps) {
  const [resources, setResources] = useState<PodResource[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResource, setSelectedResource] = useState<PodResource | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false)
  const [metadataResource, setMetadataResource] = useState<PodResource | null>(null)
  const { toast } = useToast()

  const loadResources = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/solid/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          containerUrl: `${podUrl}${currentPath}`.replace(/\/+/g, '/'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to load resources')
      }

      const data = await response.json()
      setResources(data.resources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources')
    } finally {
      setIsLoading(false)
    }
  }, [currentPath, podUrl])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleResourceClick = (resource: PodResource) => {
    if (resource.type === 'container') {
      // Navigate into container
      const newPath = `${currentPath}${resource.name}/`.replace(/\/+/g, '/')
      setCurrentPath(newPath)
    } else {
      // Select file
      setSelectedResource(resource)
      if (onResourceSelect) {
        onResourceSelect(resource)
      }
    }
  }

  const handleDownload = async (resource: PodResource) => {
    try {
      const response = await fetch('/api/solid/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceUrl: resource.url }),
      })

      if (!response.ok) {
        throw new Error('Failed to download resource')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = resource.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: `Downloaded ${resource.name}`,
      })
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to download',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (resource: PodResource) => {
    if (!confirm(`Are you sure you want to delete ${resource.name}?`)) {
      return
    }

    try {
      const response = await fetch('/api/solid/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceUrl: resource.url }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      toast({
        title: 'Success',
        description: `Deleted ${resource.name}`,
      })

      // Refresh resources
      loadResources()
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete',
        variant: 'destructive',
      })
    }
  }

  const handleViewMetadata = (resource: PodResource) => {
    setMetadataResource(resource)
    setIsMetadataDialogOpen(true)
  }

  const navigateUp = () => {
    if (currentPath === '/') return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    setCurrentPath('/' + parts.join('/') + (parts.length > 0 ? '/' : ''))
  }

  const getResourceIcon = (resource: PodResource) => {
    if (resource.type === 'container') {
      return <Folder className="h-4 w-4 text-blue-600" />
    }

    const contentType = resource.contentType?.toLowerCase() || ''
    if (contentType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-600" />
    }
    if (contentType.startsWith('video/')) {
      return <Video className="h-4 w-4 text-purple-600" />
    }
    if (contentType.startsWith('audio/')) {
      return <Music className="h-4 w-4 text-orange-600" />
    }
    if (contentType.includes('text') || contentType.includes('application/json')) {
      return <FileText className="h-4 w-4 text-gray-600" />
    }
    
    return <File className="h-4 w-4 text-gray-600" />
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

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pod Resources</CardTitle>
            <CardDescription>
              Browse and manage files in your SOLID Pod
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadResources}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPath('/')}
            className="h-auto p-1"
          >
            Home
          </Button>
          {currentPath !== '/' && (
            <>
              <span>/</span>
              {currentPath.split('/').filter(Boolean).map((part, index, array) => (
                <div key={index} className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => {
                      const newPath = '/' + array.slice(0, index + 1).join('/') + '/'
                      setCurrentPath(newPath)
                    }}
                  >
                    {part}
                  </Button>
                  {index < array.length - 1 && <span>/</span>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {currentPath !== '/' && (
            <Button variant="outline" onClick={navigateUp}>
              Up
            </Button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          /* Resources table */
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No resources match your search' : 'No resources found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources.map((resource) => (
                    <TableRow
                      key={resource.url}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <TableCell className="flex items-center gap-2">
                        {getResourceIcon(resource)}
                        <span className="font-medium">{resource.name}</span>
                        {selectedResource?.url === resource.url && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {resource.type === 'container' ? 'Folder' : 'File'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(resource.size)}</TableCell>
                      <TableCell>
                        {resource.modified
                          ? formatDistanceToNow(resource.modified, { addSuffix: true })
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {resource.type === 'file' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(resource)
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewMetadata(resource)
                              }}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Metadata
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(resource)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <PodFileUpload
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadComplete={() => {
          setIsUploadDialogOpen(false)
          loadResources()
        }}
        podUrl={podUrl}
        currentPath={currentPath}
      />
      
      <PodResourceMetadata
        isOpen={isMetadataDialogOpen}
        onClose={() => setIsMetadataDialogOpen(false)}
        resource={metadataResource}
        onMetadataUpdate={(metadata) => {
          console.log('Metadata updated:', metadata)
          // Could refresh resources or update local state here
        }}
      />
    </Card>
  )
}