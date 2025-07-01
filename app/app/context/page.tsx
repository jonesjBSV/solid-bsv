'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Brain,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Share2,
  Trash2,
  Bitcoin,
  Calendar,
  Tag,
  FileText,
  Link,
  Code,
  Eye,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ContextEntryForm } from '@/components/forms/ContextEntryForm'
import { SharedResourceForm } from '@/components/forms/SharedResourceForm'
import { NotarizationButton } from '@/components/bsv/NotarizationButton'
import { NotarizationService } from '@/lib/bsv/notarization-service'
import { Hash } from '@bsv/sdk'
import { formatDistanceToNow } from 'date-fns'
import type { ContextEntry, SharedResource } from '@/lib/database/types'

interface ContextEntryWithSharing extends ContextEntry {
  shared_resource?: SharedResource | null
  pod_resource?: { resource_path: string } | null
}

export default function ContextPage() {
  const [entries, setEntries] = useState<ContextEntryWithSharing[]>([])
  const [filteredEntries, setFilteredEntries] = useState<ContextEntryWithSharing[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ContextEntry | null>(null)
  const [sharingEntry, setSharingEntry] = useState<ContextEntry | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const { toast } = useToast()

  // Load context entries
  useEffect(() => {
    loadContextEntries()
  }, [])

  // Filter entries based on search and filters
  useEffect(() => {
    let filtered = entries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.content_type === selectedCategory)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        selectedTags.every(selectedTag =>
          entry.tags?.includes(selectedTag)
        )
      )
    }

    setFilteredEntries(filtered)
  }, [entries, searchTerm, selectedCategory, selectedTags])

  const loadContextEntries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/context/entries')
      if (!response.ok) throw new Error('Failed to load context entries')
      
      const data = await response.json()
      setEntries(data.entries || [])
      
      // Extract all unique tags
      const tags = new Set<string>()
      data.entries?.forEach((entry: ContextEntry) => {
        entry.tags?.forEach(tag => tags.add(tag))
      })
      setAllTags(Array.from(tags).sort())

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load context entries',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEntry = async (data: any) => {
    try {
      const response = await fetch('/api/context/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create context entry')

      toast({
        title: 'Success',
        description: 'Context entry created successfully',
      })

      setIsCreateDialogOpen(false)
      loadContextEntries()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create context entry',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateEntry = async (data: any) => {
    if (!editingEntry) return

    try {
      const response = await fetch(`/api/context/entries/${editingEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update context entry')

      toast({
        title: 'Success',
        description: 'Context entry updated successfully',
      })

      setEditingEntry(null)
      loadContextEntries()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update context entry',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this context entry?')) return

    try {
      const response = await fetch(`/api/context/entries/${entryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete context entry')

      toast({
        title: 'Success',
        description: 'Context entry deleted successfully',
      })

      loadContextEntries()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete context entry',
        variant: 'destructive',
      })
    }
  }

  const handleShareEntry = async (data: any) => {
    if (!sharingEntry) return

    try {
      const response = await fetch('/api/sharing/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          resource_type: 'context_entry',
          resource_id: sharingEntry.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to share context entry')

      toast({
        title: 'Success',
        description: 'Context entry shared successfully',
      })

      setIsShareDialogOpen(false)
      setSharingEntry(null)
      loadContextEntries()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share context entry',
        variant: 'destructive',
      })
    }
  }

  const handleNotarizationSuccess = async (result: any) => {
    toast({
      title: 'Notarization Complete',
      description: `Context entry notarized on BSV blockchain`,
    })
    // Refresh entries to show updated notarization status
    loadContextEntries()
  }

  const calculateContentHash = async (content: string): Promise<string> => {
    return await NotarizationService.calculateContentHash(content)
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'markdown':
        return <FileText className="h-4 w-4" />
      case 'link':
        return <Link className="h-4 w-4" />
      case 'snippet':
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'markdown':
        return 'bg-blue-100 text-blue-800'
      case 'link':
        return 'bg-green-100 text-green-800'
      case 'snippet':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Context Store
          </h1>
          <p className="text-muted-foreground mt-2">
            Your second brain knowledge base with SOLID pod storage and BSV monetization
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Context
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Context Entry</DialogTitle>
              <DialogDescription>
                Add a new entry to your second brain knowledge base
              </DialogDescription>
            </DialogHeader>
            <ContextEntryForm
              onSubmit={handleCreateEntry}
              onCancel={() => setIsCreateDialogOpen(false)}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search context entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                  <SelectItem value="snippet">Code Snippets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 20).map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTagFilter(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length > 20 && (
                    <Badge variant="outline">
                      +{allTags.length - 20} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            {(searchTerm || selectedCategory !== 'all' || selectedTags.length > 0) && ' found'}
          </h2>
          
          {filteredEntries.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {filteredEntries.filter(e => e.shared_resource).length} shared publicly
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-20 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No context entries found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedTags.length > 0
                    ? 'Try adjusting your search filters'
                    : 'Start building your second brain by adding your first context entry'
                  }
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{entry.title}</h3>
                        <Badge
                          variant="outline"
                          className={getContentTypeColor(entry.content_type)}
                        >
                          {getContentTypeIcon(entry.content_type)}
                          <span className="ml-1">{entry.content_type}</span>
                        </Badge>
                        {entry.shared_resource && (
                          <Badge variant="default">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                        {entry.pod_resource && (
                          <span className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            Linked to pod
                          </span>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSharingEntry(entry)
                            setIsShareDialogOpen(true)
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const contentHash = await calculateContentHash(entry.content)
                            // This would open a notarization dialog, but for now we'll show inline
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Notarize
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm line-clamp-3">
                      {entry.content.slice(0, 300)}
                      {entry.content.length > 300 && '...'}
                    </p>
                    
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <NotarizationButton
                        resourceId={entry.id.toString()}
                        resourceType="context_entry"
                        contentHash={entry.content_hash || Hash.sha256(Buffer.from(entry.content)).toString('hex')}
                        title={entry.title}
                        description={entry.bsv_tx_hash ? "Verify this notarized context entry" : "Notarize this context entry on BSV blockchain"}
                        onNotarizationSuccess={handleNotarizationSuccess}
                        isNotarized={!!entry.bsv_tx_hash}
                        existingTxid={entry.bsv_tx_hash || undefined}
                      />
                    </div>

                    {entry.shared_resource && (
                      <Alert>
                        <Bitcoin className="h-4 w-4" />
                        <AlertDescription>
                          This entry is shared publicly
                          {entry.shared_resource.price_satoshis && (
                            <span> for {entry.shared_resource.price_satoshis} satoshis</span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Context Entry</DialogTitle>
            <DialogDescription>
              Update your context entry
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <ContextEntryForm
              initialData={editingEntry}
              onSubmit={handleUpdateEntry}
              onCancel={() => setEditingEntry(null)}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Context Entry</DialogTitle>
            <DialogDescription>
              Make this context entry available to others with optional payment
            </DialogDescription>
          </DialogHeader>
          {sharingEntry && (
            <SharedResourceForm
              onSubmit={handleShareEntry}
              onCancel={() => {
                setIsShareDialogOpen(false)
                setSharingEntry(null)
              }}
              mode="create"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}