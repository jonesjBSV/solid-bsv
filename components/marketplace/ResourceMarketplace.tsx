'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Globe, 
  Bitcoin, 
  TrendingUp, 
  Star, 
  Clock,
  Filter,
  ChevronRight,
  User,
  Tag
} from 'lucide-react'
import { MicropaymentButton } from '@/components/bsv/MicropaymentButton'
import { getOverlayService, type OverlayResource } from '@/lib/bsv/overlay-service'
import { useToast } from '@/hooks/use-toast'

interface MarketplaceFilters {
  resourceType?: string
  priceRange?: { min: number; max: number }
  tags?: string[]
  sortBy?: 'newest' | 'popular' | 'price-low' | 'price-high'
}

export function ResourceMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('tm_context_general')
  const [filters, setFilters] = useState<MarketplaceFilters>({})
  const [resources, setResources] = useState<OverlayResource[]>([])
  const [trendingTopics, setTrendingTopics] = useState<{ topic: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const { toast } = useToast()

  // Fetch trending topics
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const overlayService = getOverlayService()
        const topics = await overlayService.getTrendingTopics()
        setTrendingTopics(topics)
      } catch (error) {
        console.error('Failed to fetch trending topics:', error)
      }
    }
    fetchTrendingTopics()
  }, [])

  // Search resources
  const searchResources = async () => {
    setIsLoading(true)
    try {
      const overlayService = getOverlayService()
      const result = await overlayService.searchResources({
        topic: selectedTopic,
        query: searchQuery,
        filters: {
          resourceType: filters.resourceType,
          priceRange: filters.priceRange,
          tags: filters.tags,
        },
        limit: 20,
      })

      // Sort results
      let sortedResources = [...result.resources]
      switch (filters.sortBy) {
        case 'popular':
          // In real app, would sort by access count
          break
        case 'price-low':
          sortedResources.sort((a, b) => (a.priceSatoshis || 0) - (b.priceSatoshis || 0))
          break
        case 'price-high':
          sortedResources.sort((a, b) => (b.priceSatoshis || 0) - (a.priceSatoshis || 0))
          break
        case 'newest':
        default:
          sortedResources.sort((a, b) => b.timestamp - a.timestamp)
          break
      }

      setResources(sortedResources)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Search failed:', error)
      toast({
        title: 'Search Failed',
        description: 'Failed to search overlay network',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial search on mount
  useEffect(() => {
    searchResources()
  }, [selectedTopic])

  const formatPrice = (satoshis?: number) => {
    if (!satoshis) return 'Free'
    const bsv = satoshis / 100000000
    return `${bsv.toFixed(8)} BSV`
  }

  const getAccessTypeLabel = (resource: OverlayResource) => {
    if (!resource.priceSatoshis) return 'Free'
    if (resource.accessType === 'payment-required') return 'Paid'
    return 'Public'
  }

  const ResourceCard = ({ resource }: { resource: OverlayResource }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {resource.title || `${resource.resourceType} #${resource.resourceId.slice(0, 8)}`}
            </CardTitle>
            <CardDescription className="mt-1">
              {resource.description || 'No description available'}
            </CardDescription>
          </div>
          <Badge variant={resource.priceSatoshis ? 'default' : 'secondary'}>
            {getAccessTypeLabel(resource)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {resource.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {resource.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{resource.author.slice(0, 8)}...</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(resource.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {resource.priceSatoshis ? (
            <MicropaymentButton
              resourceId={resource.resourceId}
              title={resource.title || 'Resource Access'}
              description={resource.description || 'Access to this resource'}
              priceSatoshis={resource.priceSatoshis}
              accessType="single"
              recipientIdentityKey={resource.author || ''}
              onPaymentSuccess={(result) => {
                toast({
                  title: 'Access Granted',
                  description: 'You now have access to this resource',
                })
              }}
            />
          ) : (
            <Button className="w-full" variant="default">
              <Globe className="h-4 w-4 mr-2" />
              Access Free Resource
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            BSV Resource Marketplace
          </CardTitle>
          <CardDescription>
            Discover and access shared resources from the BSV overlay network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchResources()}
                className="pl-9"
              />
            </div>
            <Button onClick={searchResources}>
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tm_context_general">General Context</SelectItem>
                <SelectItem value="tm_pod_resource">Pod Resources</SelectItem>
                <SelectItem value="tm_did">Identity (DID)</SelectItem>
                <SelectItem value="micropayment_offers">Payment Offers</SelectItem>
                <SelectItem value="tm_notarization">Notarizations</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.sortBy || 'newest'} 
              onValueChange={(v: any) => setFilters({ ...filters, sortBy: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.resourceType || 'all'}
              onValueChange={(v) => setFilters({ ...filters, resourceType: v === 'all' ? undefined : v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="context_entry">Context Entry</SelectItem>
                <SelectItem value="pod_resource">Pod Resource</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trending Topics */}
          {trendingTopics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Trending:</span>
              {trendingTopics.slice(0, 5).map((topic) => (
                <Badge
                  key={topic.topic}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => setSelectedTopic(topic.topic)}
                >
                  {topic.topic} ({topic.count})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : resources.length > 0 ? (
          resources.map((resource) => (
            <ResourceCard key={resource.resourceId} resource={resource} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No resources found. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="text-center">
          <Button variant="outline" onClick={() => {/* Load more logic */}}>
            Load More
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}