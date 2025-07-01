// BSV Overlay Network Service for resource discovery and public sharing
// Follows BSV SPV architecture with topic-based publishing

import { Overlay } from '@bsv/overlay'

export interface OverlayConfig {
  nodes: string[]
  network: 'mainnet' | 'testnet'
  defaultTopics?: string[]
}

export interface OverlayResource {
  resourceId: string
  resourceType: string
  contentHash: string
  txid?: string
  title?: string
  description?: string
  tags?: string[]
  author?: string
  priceSatoshis?: number
  accessType?: 'public' | 'payment-required'
  timestamp: number
  metadata?: Record<string, any>
}

export interface OverlaySearchParams {
  topic: string
  query?: string
  filters?: {
    resourceType?: string
    priceRange?: { min: number; max: number }
    tags?: string[]
    author?: string
  }
  limit?: number
  offset?: number
}

export interface OverlaySearchResult {
  resources: OverlayResource[]
  total: number
  hasMore: boolean
}

export class OverlayService {
  private overlay: Overlay | null = null
  private config: OverlayConfig
  private subscribedTopics: Set<string> = new Set()

  constructor(config: OverlayConfig) {
    this.config = config
    this.initializeOverlay()
  }

  private async initializeOverlay() {
    try {
      // Initialize overlay client with multiple nodes for redundancy
      this.overlay = new Overlay({
        nodes: this.config.nodes,
        network: this.config.network,
      })

      // Subscribe to default topics if provided
      if (this.config.defaultTopics) {
        for (const topic of this.config.defaultTopics) {
          await this.subscribeTopic(topic)
        }
      }
    } catch (error) {
      console.error('Failed to initialize overlay:', error)
    }
  }

  // Subscribe to an overlay topic for receiving updates
  async subscribeTopic(topic: string): Promise<void> {
    if (!this.overlay) {
      throw new Error('Overlay not initialized')
    }

    if (this.subscribedTopics.has(topic)) {
      return // Already subscribed
    }

    try {
      await this.overlay.subscribe(topic)
      this.subscribedTopics.add(topic)
      console.log(`Subscribed to overlay topic: ${topic}`)
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error)
      throw error
    }
  }

  // Publish resource to overlay network
  async publishResource(topic: string, resource: OverlayResource): Promise<void> {
    if (!this.overlay) {
      throw new Error('Overlay not initialized')
    }

    try {
      // Ensure we're subscribed to the topic
      await this.subscribeTopic(topic)

      // Publish to overlay
      await this.overlay.publish(topic, {
        data: resource,
        timestamp: Date.now(),
        version: '1.0',
      })

      console.log(`Published to overlay topic "${topic}":`, resource.resourceId)
    } catch (error) {
      console.error('Failed to publish to overlay:', error)
      throw error
    }
  }

  // Search for resources on overlay network
  async searchResources(params: OverlaySearchParams): Promise<OverlaySearchResult> {
    if (!this.overlay) {
      throw new Error('Overlay not initialized')
    }

    try {
      // Ensure we're subscribed to the search topic
      await this.subscribeTopic(params.topic)

      // Query overlay for resources
      const results = await this.overlay.query(params.topic, {
        limit: params.limit || 50,
        offset: params.offset || 0,
      })

      // Filter results based on search parameters
      let resources = results.data as OverlayResource[]
      
      if (params.query) {
        const query = params.query.toLowerCase()
        resources = resources.filter(r => 
          r.title?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }

      if (params.filters) {
        // Apply filters
        if (params.filters.resourceType) {
          resources = resources.filter(r => r.resourceType === params.filters.resourceType)
        }
        
        if (params.filters.priceRange) {
          resources = resources.filter(r => {
            const price = r.priceSatoshis || 0
            return price >= params.filters.priceRange!.min && 
                   price <= params.filters.priceRange!.max
          })
        }
        
        if (params.filters.tags && params.filters.tags.length > 0) {
          resources = resources.filter(r => 
            r.tags?.some(tag => params.filters.tags!.includes(tag))
          )
        }
        
        if (params.filters.author) {
          resources = resources.filter(r => r.author === params.filters.author)
        }
      }

      // Sort by timestamp (newest first)
      resources.sort((a, b) => b.timestamp - a.timestamp)

      return {
        resources: resources.slice(0, params.limit || 50),
        total: resources.length,
        hasMore: resources.length > (params.limit || 50),
      }
    } catch (error) {
      console.error('Search failed:', error)
      return {
        resources: [],
        total: 0,
        hasMore: false,
      }
    }
  }

  // Get trending topics from overlay network
  async getTrendingTopics(): Promise<{ topic: string; count: number }[]> {
    if (!this.overlay) {
      throw new Error('Overlay not initialized')
    }

    try {
      // In real implementation, this would query overlay statistics
      // For now, return common topics
      return [
        { topic: 'tm_context_general', count: 156 },
        { topic: 'tm_pod_resource', count: 89 },
        { topic: 'tm_did', count: 45 },
        { topic: 'tm_notarization', count: 234 },
        { topic: 'micropayment_offers', count: 67 },
      ]
    } catch (error) {
      console.error('Failed to get trending topics:', error)
      return []
    }
  }

  // Monitor overlay topic for real-time updates
  async monitorTopic(
    topic: string, 
    callback: (resource: OverlayResource) => void
  ): Promise<() => void> {
    if (!this.overlay) {
      throw new Error('Overlay not initialized')
    }

    // Subscribe to topic
    await this.subscribeTopic(topic)

    // Set up listener
    const listener = (data: any) => {
      if (data.topic === topic && data.data) {
        callback(data.data as OverlayResource)
      }
    }

    this.overlay.on('message', listener)

    // Return unsubscribe function
    return () => {
      this.overlay?.off('message', listener)
    }
  }

  // Get resource by ID from overlay
  async getResource(topic: string, resourceId: string): Promise<OverlayResource | null> {
    if (!this.overlay) {
      throw new Error('Overlay not initialized')
    }

    try {
      const results = await this.searchResources({
        topic,
        filters: { resourceType: 'any' },
        limit: 1000,
      })

      return results.resources.find(r => r.resourceId === resourceId) || null
    } catch (error) {
      console.error('Failed to get resource:', error)
      return null
    }
  }

  // Batch publish multiple resources
  async batchPublish(
    publications: { topic: string; resource: OverlayResource }[]
  ): Promise<void> {
    const results = await Promise.allSettled(
      publications.map(pub => this.publishResource(pub.topic, pub.resource))
    )

    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length > 0) {
      console.error(`${failed.length} publications failed`)
    }
  }

  // Get statistics for a topic
  async getTopicStats(topic: string): Promise<{
    totalResources: number
    uniqueAuthors: number
    totalValue: number
    lastUpdated: Date
  }> {
    try {
      const results = await this.searchResources({ topic, limit: 1000 })
      
      const uniqueAuthors = new Set(results.resources.map(r => r.author).filter(Boolean))
      const totalValue = results.resources.reduce((sum, r) => sum + (r.priceSatoshis || 0), 0)
      const lastUpdated = results.resources.length > 0 
        ? new Date(Math.max(...results.resources.map(r => r.timestamp)))
        : new Date()

      return {
        totalResources: results.total,
        uniqueAuthors: uniqueAuthors.size,
        totalValue,
        lastUpdated,
      }
    } catch (error) {
      console.error('Failed to get topic stats:', error)
      return {
        totalResources: 0,
        uniqueAuthors: 0,
        totalValue: 0,
        lastUpdated: new Date(),
      }
    }
  }

  // Clean up and disconnect
  async disconnect(): Promise<void> {
    if (this.overlay) {
      for (const topic of this.subscribedTopics) {
        await this.overlay.unsubscribe(topic)
      }
      this.subscribedTopics.clear()
      this.overlay = null
    }
  }
}

// Default overlay configuration
export const defaultOverlayConfig: OverlayConfig = {
  nodes: [
    'https://overlay1.bsvb.tech',
    'https://overlay2.bsvb.tech',
    'https://overlay3.bsvb.tech',
  ],
  network: 'mainnet',
  defaultTopics: [
    'tm_context_general',
    'tm_pod_resource',
    'tm_did',
    'tm_vc',
    'tm_notarization',
    'micropayment_offers',
  ],
}

// Singleton instance
let overlayServiceInstance: OverlayService | null = null

export function getOverlayService(config?: OverlayConfig): OverlayService {
  if (!overlayServiceInstance) {
    overlayServiceInstance = new OverlayService(config || defaultOverlayConfig)
  }
  return overlayServiceInstance
}