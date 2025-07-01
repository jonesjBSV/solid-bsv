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
  Store,
  Search,
  Filter,
  Bitcoin,
  Calendar,
  Tag,
  FileText,
  Link,
  Code,
  Eye,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Crown,
  Zap,
  Shield,
  AlertCircle,
  Download,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { MicropaymentButton } from '@/components/bsv/MicropaymentButton'
import { useBSVWallet } from '@/hooks/useBSVWallet'
import { formatDistanceToNow } from 'date-fns'
import type { SharedResource } from '@/lib/database/types'

interface MarketplaceResource extends SharedResource {
  context_entry?: {
    title: string
    content_type: string
    content: string
    tags: string[]
  } | null
  pod_resource?: {
    resource_path: string
  } | null
  user?: {
    name?: string
    id: string
  } | null
}

export default function MarketplacePage() {
  const [resources, setResources] = useState<MarketplaceResource[]>([])
  const [filteredResources, setFilteredResources] = useState<MarketplaceResource[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState<MarketplaceResource | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { toast } = useToast()
  const { isConnected: bsvConnected } = useBSVWallet()

  // Load marketplace resources
  useEffect(() => {
    loadMarketplaceResources()
  }, [])

  // Filter and sort resources
  useEffect(() => {
    let filtered = resources

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource => {
        const title = resource.context_entry?.title || resource.pod_resource?.resource_path || ''
        const content = resource.context_entry?.content || ''
        const tags = resource.context_entry?.tags?.join(' ') || ''
        const description = resource.description || ''
        
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'context_entry') {
        filtered = filtered.filter(resource => resource.resource_type === 'context_entry')
      } else if (selectedCategory === 'pod_resource') {
        filtered = filtered.filter(resource => resource.resource_type === 'pod_resource')
      } else {
        // Filter by content type for context entries
        filtered = filtered.filter(resource => 
          resource.resource_type === 'context_entry' && 
          resource.context_entry?.content_type === selectedCategory
        )
      }
    }

    // Price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(resource => {
        const price = resource.price_satoshis || 0
        switch (priceRange) {
          case 'free':
            return price === 0
          case 'low':
            return price > 0 && price <= 1000
          case 'medium':
            return price > 1000 && price <= 10000
          case 'high':
            return price > 10000
          default:
            return true
        }
      })
    }

    // Sort resources
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.price_satoshis || 0) - (b.price_satoshis || 0)
        case 'price_high':
          return (b.price_satoshis || 0) - (a.price_satoshis || 0)
        case 'popular':
          return (b.total_access_count || 0) - (a.total_access_count || 0)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredResources(filtered)
  }, [resources, searchTerm, selectedCategory, priceRange, sortBy])

  const loadMarketplaceResources = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/marketplace/resources')
      if (!response.ok) throw new Error('Failed to load marketplace resources')
      
      const data = await response.json()
      setResources(data.resources || [])

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load marketplace resources',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseSuccess = (result: any) => {
    toast({
      title: 'Purchase Successful',
      description: 'You now have access to this resource',
    })
    // Refresh resources to update access counts
    loadMarketplaceResources()
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

  const formatPrice = (satoshis: number) => {
    if (satoshis === 0) return 'Free'
    const bsv = satoshis / 100000000
    return `${bsv.toFixed(8)} BSV (${satoshis.toLocaleString()} sats)`
  }

  const getPopularityBadge = (accessCount: number) => {
    if (accessCount >= 100) return { label: 'Popular', variant: 'default' as const }
    if (accessCount >= 50) return { label: 'Trending', variant: 'secondary' as const }
    return null
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8" />
            Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover and purchase valuable content with BSV micropayments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredResources.length} resources
          </Badge>
          <Badge variant={bsvConnected ? "default" : "secondary"}>
            BSV: {bsvConnected ? "Ready" : "Connect Wallet"}
          </Badge>
        </div>
      </div>

      {!bsvConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your BSV wallet to purchase marketplace resources with micropayments.
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search marketplace..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="context_entry">Context Entries</SelectItem>
                  <SelectItem value="pod_resource">Pod Resources</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                  <SelectItem value="snippet">Code Snippets</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="low">1-1,000 sats</SelectItem>
                  <SelectItem value="medium">1,000-10,000 sats</SelectItem>
                  <SelectItem value="high">10,000+ sats</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                      <div className="h-20 bg-muted animate-pulse rounded" />
                      <div className="h-8 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No resources found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search filters or check back later for new content
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {resource.context_entry?.title || 
                           resource.pod_resource?.resource_path?.split('/').pop() || 
                           'Untitled Resource'}
                        </h3>
                        {getPopularityBadge(resource.total_access_count || 0) && (
                          <Badge 
                            variant={getPopularityBadge(resource.total_access_count || 0)!.variant}
                            className="text-xs"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {getPopularityBadge(resource.total_access_count || 0)!.label}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {resource.context_entry && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getContentTypeColor(resource.context_entry.content_type)}`}
                          >
                            {getContentTypeIcon(resource.context_entry.content_type)}
                            <span className="ml-1">{resource.context_entry.content_type}</span>
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type === 'context_entry' ? 'Context' : 'Pod File'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      
                      {resource.context_entry?.content && (
                        <p className="text-sm line-clamp-3">
                          {resource.context_entry.content.slice(0, 150)}
                          {resource.context_entry.content.length > 150 && '...'}
                        </p>
                      )}

                      {resource.context_entry?.tags && resource.context_entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.context_entry.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {resource.context_entry.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resource.context_entry.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {resource.total_access_count || 0} access{(resource.total_access_count || 0) !== 1 ? 'es' : ''}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {formatPrice(resource.price_satoshis || 0)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedResource(resource)
                              setIsPreviewOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>

                        {resource.price_satoshis && resource.price_satoshis > 0 ? (
                          <MicropaymentButton
                            resourceId={resource.id.toString()}
                            title={resource.context_entry?.title || 'Resource'}
                            description={resource.description || 'Marketplace resource'}
                            priceSatoshis={resource.price_satoshis}
                            accessType="single"
                            recipientIdentityKey="mock_recipient_key" // In real app, this would be the seller's identity key
                            onPaymentSuccess={handlePurchaseSuccess}
                            disabled={!bsvConnected}
                          />
                        ) : (
                          <Button className="w-full" variant="default">
                            <Download className="h-4 w-4 mr-2" />
                            Access Free
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Featured Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Curated high-quality content from top contributors
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Trending Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Most popular resources this week
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResource?.context_entry?.title || 
               selectedResource?.pod_resource?.resource_path?.split('/').pop() ||
               'Resource Preview'}
            </DialogTitle>
            <DialogDescription>
              {selectedResource?.description || 'Resource details and preview'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedResource && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedResource.resource_type}
                </div>
                <div>
                  <span className="font-medium">Price:</span> {formatPrice(selectedResource.price_satoshis || 0)}
                </div>
                <div>
                  <span className="font-medium">Access Count:</span> {selectedResource.total_access_count || 0}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {formatDistanceToNow(new Date(selectedResource.created_at), { addSuffix: true })}
                </div>
              </div>

              {selectedResource.context_entry && (
                <div className="space-y-2">
                  <h4 className="font-medium">Content Preview:</h4>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedResource.context_entry.content.slice(0, 500)}
                      {selectedResource.context_entry.content.length > 500 && '...'}
                    </p>
                  </div>
                  
                  {selectedResource.context_entry.tags && selectedResource.context_entry.tags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedResource.context_entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>BSV SPV Payment:</strong> Purchase this resource with a secure BSV micropayment. 
                  Your transaction will be processed instantly using BEEF format for immediate access.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}