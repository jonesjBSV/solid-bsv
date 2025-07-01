import { SolidPodService } from './solid-pod-service'
import { createPodResource, updatePodResource, getPodResourcesForUser } from '@/lib/database/queries'
import { Session } from '@inrupt/solid-client-authn-browser'

interface SyncStatus {
  totalResources: number
  syncedResources: number
  failedResources: number
  errors: string[]
  lastSyncTime: Date
}

interface ResourceSyncItem {
  url: string
  name: string
  type: 'file' | 'container'
  size?: number
  modified?: Date
  contentType?: string
  contentHash?: string
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed'
  error?: string
}

export class PodSyncService {
  private podService: SolidPodService
  private userId: string
  private syncInProgress = false

  constructor(session: Session, userId: string) {
    this.podService = new SolidPodService(session)
    this.userId = userId
  }

  /**
   * Sync all pod resources with the database
   */
  async syncAllResources(
    podUrl: string,
    onProgress?: (status: SyncStatus) => void
  ): Promise<SyncStatus> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }

    this.syncInProgress = true
    const status: SyncStatus = {
      totalResources: 0,
      syncedResources: 0,
      failedResources: 0,
      errors: [],
      lastSyncTime: new Date(),
    }

    try {
      // Get all resources from pod recursively
      const allResources = await this.discoverAllResources(podUrl)
      status.totalResources = allResources.length

      if (onProgress) {
        onProgress({ ...status })
      }

      // Sync each resource
      for (const resource of allResources) {
        try {
          await this.syncResource(resource)
          status.syncedResources++
        } catch (error) {
          status.failedResources++
          status.errors.push(
            `Failed to sync ${resource.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
          console.error('Resource sync error:', error)
        }

        if (onProgress) {
          onProgress({ ...status })
        }
      }

      return status
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Sync a single resource
   */
  async syncResource(resource: ResourceSyncItem): Promise<void> {
    // Check if resource already exists in database
    const existingResources = await getPodResourcesForUser(this.userId, {
      // Filter by resource URL/path
    })

    const existingResource = existingResources.data.find(
      r => r.resource_path === resource.url || r.pod_url === resource.url
    )

    const resourceData = {
      resource_path: resource.name,
      resource_type: this.mapResourceType(resource),
      status: 'private' as const,
      pod_url: resource.url,
      content_hash: resource.contentHash,
      mime_type: resource.contentType,
      resource_size: resource.size,
    }

    if (existingResource) {
      // Update existing resource
      await updatePodResource({
        id: existingResource.id,
        ...resourceData,
      })
    } else {
      // Create new resource
      await createPodResource({
        ...resourceData,
        user_id: this.userId,
      })
    }
  }

  /**
   * Discover all resources in a pod recursively
   */
  private async discoverAllResources(
    containerUrl: string,
    visited = new Set<string>()
  ): Promise<ResourceSyncItem[]> {
    if (visited.has(containerUrl)) {
      return [] // Avoid infinite loops
    }
    visited.add(containerUrl)

    const resources: ResourceSyncItem[] = []

    try {
      const containerResources = await this.podService.listResources(containerUrl)

      for (const resource of containerResources) {
        const syncItem: ResourceSyncItem = {
          ...resource,
          syncStatus: 'pending',
        }

        resources.push(syncItem)

        // If it's a container, recursively discover its contents
        if (resource.type === 'container') {
          const subResources = await this.discoverAllResources(
            resource.url,
            visited
          )
          resources.push(...subResources)
        }
      }
    } catch (error) {
      console.error(`Failed to list resources in ${containerUrl}:`, error)
    }

    return resources
  }

  /**
   * Calculate content hash for a resource
   */
  private async calculateContentHash(resourceUrl: string): Promise<string | undefined> {
    try {
      const { blob } = await this.podService.downloadFile(resourceUrl)
      if (!blob) return undefined

      const arrayBuffer = await blob.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return `sha256:${hashHex}`
    } catch (error) {
      console.error('Failed to calculate content hash:', error)
      return undefined
    }
  }

  /**
   * Map pod resource type to database resource type
   */
  private mapResourceType(resource: ResourceSyncItem): string {
    if (resource.type === 'container') {
      return 'container'
    }

    const contentType = resource.contentType?.toLowerCase()
    if (!contentType) return 'file'

    if (contentType.startsWith('text/')) return 'document'
    if (contentType.startsWith('image/')) return 'image'
    if (contentType.startsWith('audio/')) return 'audio'
    if (contentType.startsWith('video/')) return 'video'
    if (contentType.includes('json') || contentType.includes('xml')) return 'data'
    
    return 'file'
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress
  }

  /**
   * Get sync status for a user's resources
   */
  async getSyncStatus(): Promise<{
    lastSync?: Date
    totalResources: number
    outOfSync: number
  }> {
    try {
      const resources = await getPodResourcesForUser(this.userId)
      
      // In a real implementation, this would check for:
      // - Resources that exist in pod but not in database
      // - Resources that exist in database but not in pod
      // - Resources with different modification times
      
      return {
        totalResources: resources.data.length,
        outOfSync: 0, // Placeholder
      }
    } catch (error) {
      console.error('Failed to get sync status:', error)
      throw error
    }
  }

  /**
   * Watch for changes in pod resources (for real-time sync)
   */
  async watchForChanges(
    podUrl: string,
    onResourceChanged: (resource: ResourceSyncItem) => void
  ): Promise<() => void> {
    // In a real implementation, this would:
    // 1. Set up WebSocket connections to pod notifications
    // 2. Poll for changes at regular intervals
    // 3. Use SOLID notification protocols
    
    // For now, implement a simple polling mechanism
    const intervalId = setInterval(async () => {
      try {
        // Check for changes (simplified)
        console.log('Checking for pod changes...')
      } catch (error) {
        console.error('Change detection error:', error)
      }
    }, 30000) // Check every 30 seconds

    // Return cleanup function
    return () => {
      clearInterval(intervalId)
    }
  }
}