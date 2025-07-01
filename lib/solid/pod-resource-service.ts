import {
  getSolidDataset,
  getThing,
  getThingAll,
  setThing,
  saveSolidDatasetAt,
  createSolidDataset,
  createThing,
  setStringNoLocale,
  setDatetime,
  setUrl,
  getStringNoLocale,
  getDatetime,
  getUrl,
  removeThing,
  deleteFile,
  overwriteFile,
  getFile,
} from '@inrupt/solid-client'
import { DCTERMS, RDF, FOAF } from '@inrupt/vocab-common-rdf'
import { createHash } from 'crypto'

export interface PodResource {
  id: string
  resourcePath: string
  resourceType: 'note' | 'document' | 'context' | 'file'
  status: 'private' | 'shared' | 'notarized' | 'public'
  podUrl: string
  contentHash: string
  title?: string
  description?: string
  tags: string[]
  metadata: Record<string, any>
  created: Date
  modified: Date
  bsvAttestation?: {
    txHash: string
    blockHeight: number
    overlayTopic?: string
  }
  sharing?: {
    priceSatoshis: number
    accessCount: number
    totalEarnings: number
  }
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
}

export class PodResourceService {
  constructor(private solidFetch: typeof fetch) {}

  async listResources(containerUrl: string): Promise<PodResource[]> {
    try {
      const dataset = await getSolidDataset(containerUrl, { fetch: this.solidFetch })
      const things = getThingAll(dataset)
      
      const resources: PodResource[] = []
      
      for (const thing of things) {
        if (!thing.url.endsWith('/')) { // Skip containers
          const resource = await this.thingToResource(thing)
          if (resource) {
            resources.push(resource)
          }
        }
      }
      
      return resources.sort((a, b) => b.modified.getTime() - a.modified.getTime())
    } catch (error) {
      console.error('Error listing pod resources:', error)
      return []
    }
  }

  async getResource(resourceUrl: string): Promise<PodResource | null> {
    try {
      const dataset = await getSolidDataset(resourceUrl, { fetch: this.solidFetch })
      const thing = getThing(dataset, resourceUrl)
      
      if (!thing) {
        return null
      }
      
      return this.thingToResource(thing)
    } catch (error) {
      console.error('Error getting pod resource:', error)
      return null
    }
  }

  async createResource(
    containerUrl: string,
    resource: Omit<PodResource, 'id' | 'created' | 'modified' | 'syncStatus'>
  ): Promise<PodResource | null> {
    try {
      const resourceUrl = `${containerUrl}${resource.resourcePath}`
      
      // Create the resource file first
      let content = ''
      if (resource.resourceType === 'note' || resource.resourceType === 'context') {
        content = JSON.stringify({
          title: resource.title,
          description: resource.description,
          content: resource.metadata.content || '',
          tags: resource.tags,
          type: resource.resourceType,
        }, null, 2)
      }
      
      const blob = new Blob([content], { type: 'application/json' })
      await overwriteFile(resourceUrl, blob, { fetch: this.solidFetch })
      
      // Create metadata
      const metadataUrl = `${resourceUrl}.meta`
      const metadataDataset = createSolidDataset()
      
      const now = new Date()
      let metadataThing = createThing({ url: metadataUrl })
      metadataThing = setStringNoLocale(metadataThing, RDF.type, resource.resourceType)
      metadataThing = setStringNoLocale(metadataThing, DCTERMS.title, resource.title || '')
      metadataThing = setStringNoLocale(metadataThing, DCTERMS.description, resource.description || '')
      metadataThing = setDatetime(metadataThing, DCTERMS.created, now)
      metadataThing = setDatetime(metadataThing, DCTERMS.modified, now)
      metadataThing = setStringNoLocale(metadataThing, 'http://example.org/status', resource.status)
      metadataThing = setStringNoLocale(metadataThing, 'http://example.org/contentHash', resource.contentHash)
      
      // Add tags
      resource.tags.forEach((tag, index) => {
        metadataThing = setStringNoLocale(metadataThing, `http://example.org/tag${index}`, tag)
      })
      
      const updatedMetadataDataset = setThing(metadataDataset, metadataThing)
      await saveSolidDatasetAt(metadataUrl, updatedMetadataDataset, { fetch: this.solidFetch })
      
      // Return the created resource
      return {
        id: resourceUrl,
        ...resource,
        created: now,
        modified: now,
        syncStatus: 'synced' as const,
      }
    } catch (error) {
      console.error('Error creating pod resource:', error)
      return null
    }
  }

  async updateResource(
    resourceUrl: string,
    updates: Partial<PodResource>
  ): Promise<PodResource | null> {
    try {
      const metadataUrl = `${resourceUrl}.meta`
      const metadataDataset = await getSolidDataset(metadataUrl, { fetch: this.solidFetch })
      let metadataThing = getThing(metadataDataset, metadataUrl)
      
      if (!metadataThing) {
        return null
      }
      
      const now = new Date()
      
      if (updates.title) {
        metadataThing = setStringNoLocale(metadataThing, DCTERMS.title, updates.title)
      }
      if (updates.description) {
        metadataThing = setStringNoLocale(metadataThing, DCTERMS.description, updates.description)
      }
      if (updates.status) {
        metadataThing = setStringNoLocale(metadataThing, 'http://example.org/status', updates.status)
      }
      if (updates.contentHash) {
        metadataThing = setStringNoLocale(metadataThing, 'http://example.org/contentHash', updates.contentHash)
      }
      
      metadataThing = setDatetime(metadataThing, DCTERMS.modified, now)
      
      const updatedMetadataDataset = setThing(metadataDataset, metadataThing)
      await saveSolidDatasetAt(metadataUrl, updatedMetadataDataset, { fetch: this.solidFetch })
      
      return this.getResource(resourceUrl)
    } catch (error) {
      console.error('Error updating pod resource:', error)
      return null
    }
  }

  async deleteResource(resourceUrl: string): Promise<boolean> {
    try {
      // Delete the main resource file
      await deleteFile(resourceUrl, { fetch: this.solidFetch })
      
      // Delete the metadata file
      const metadataUrl = `${resourceUrl}.meta`
      try {
        await deleteFile(metadataUrl, { fetch: this.solidFetch })
      } catch {
        // Metadata file might not exist
      }
      
      return true
    } catch (error) {
      console.error('Error deleting pod resource:', error)
      return false
    }
  }

  async getResourceContent(resourceUrl: string): Promise<string | null> {
    try {
      const file = await getFile(resourceUrl, { fetch: this.solidFetch })
      return await file.text()
    } catch (error) {
      console.error('Error getting resource content:', error)
      return null
    }
  }

  async updateResourceContent(resourceUrl: string, content: string): Promise<boolean> {
    try {
      const blob = new Blob([content], { type: 'application/json' })
      await overwriteFile(resourceUrl, blob, { fetch: this.solidFetch })
      
      // Update content hash
      const contentHash = createHash('sha256').update(content).digest('hex')
      await this.updateResource(resourceUrl, { 
        contentHash,
        modified: new Date(),
      })
      
      return true
    } catch (error) {
      console.error('Error updating resource content:', error)
      return false
    }
  }

  private async thingToResource(thing: any): Promise<PodResource | null> {
    try {
      const metadataUrl = `${thing.url}.meta`
      let metadataThing
      
      try {
        const metadataDataset = await getSolidDataset(metadataUrl, { fetch: this.solidFetch })
        metadataThing = getThing(metadataDataset, metadataUrl)
      } catch {
        // Metadata might not exist for some resources
      }
      
      const title = metadataThing ? getStringNoLocale(metadataThing, DCTERMS.title) : null
      const description = metadataThing ? getStringNoLocale(metadataThing, DCTERMS.description) : null
      const created = metadataThing ? getDatetime(metadataThing, DCTERMS.created) : null
      const modified = metadataThing ? getDatetime(metadataThing, DCTERMS.modified) : null
      const status = metadataThing ? getStringNoLocale(metadataThing, 'http://example.org/status') : 'private'
      const contentHash = metadataThing ? getStringNoLocale(metadataThing, 'http://example.org/contentHash') : ''
      
      // Extract tags
      const tags: string[] = []
      for (let i = 0; i < 10; i++) {
        const tag = metadataThing ? getStringNoLocale(metadataThing, `http://example.org/tag${i}`) : null
        if (tag) {
          tags.push(tag)
        }
      }
      
      const pathParts = thing.url.split('/')
      const resourcePath = pathParts[pathParts.length - 1]
      const resourceType = this.inferResourceType(resourcePath)
      
      return {
        id: thing.url,
        resourcePath,
        resourceType,
        status: status as PodResource['status'],
        podUrl: thing.url,
        contentHash: contentHash || '',
        title: title || resourcePath,
        description: description || '',
        tags,
        metadata: {},
        created: created || new Date(),
        modified: modified || new Date(),
        syncStatus: 'synced' as const,
      }
    } catch (error) {
      console.error('Error converting thing to resource:', error)
      return null
    }
  }

  private inferResourceType(resourcePath: string): PodResource['resourceType'] {
    const extension = resourcePath.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'md':
      case 'txt':
        return 'note'
      case 'json':
        return 'context'
      case 'pdf':
      case 'doc':
      case 'docx':
        return 'document'
      default:
        return 'file'
    }
  }

  generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }
}