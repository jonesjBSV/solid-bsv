import {
  getSolidDataset,
  getThing,
  getThingAll,
  getStringNoLocale,
  getUrl,
  saveSolidDatasetAt,
  createSolidDataset,
  createThing,
  addUrl,
  addStringNoLocale,
  setThing,
  universalAccess,
  getFile,
  overwriteFile,
  deleteFile,
  getSourceUrl,
  WithServerResourceInfo,
  SolidDataset,
  Thing,
  File as SolidFile,
  isRawData,
  getContentType,
} from "@inrupt/solid-client"
import { Session } from "@inrupt/solid-client-authn-browser"
import { FOAF, RDF, VCARD } from "@inrupt/vocab-common-rdf"

export interface PodResource {
  url: string
  name: string
  type: string
  size?: number
  modified?: Date
  contentType?: string
}

export interface PodProfile {
  webId: string
  name?: string
  email?: string
  storage?: string[]
}

export class SolidPodService {
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  /**
   * Validate if a URL is a valid SOLID Pod URL
   */
  async validatePodUrl(podUrl: string): Promise<{
    isValid: boolean
    error?: string
    profileUrl?: string
  }> {
    try {
      const url = new URL(podUrl)
      
      // Try to fetch the pod's profile document
      const profileUrl = `${url.origin}/profile/card`
      const response = await fetch(profileUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${this.session.info.sessionId}`,
        },
      })

      if (response.ok) {
        return { isValid: true, profileUrl }
      } else if (response.status === 401) {
        return { isValid: false, error: "Authentication required" }
      } else if (response.status === 404) {
        return { isValid: false, error: "Pod profile not found" }
      } else {
        return { isValid: false, error: "Invalid pod URL" }
      }
    } catch (error) {
      return { isValid: false, error: "Invalid URL format" }
    }
  }

  /**
   * Discover user's pod URL from WebID
   */
  async discoverPodFromWebId(webId: string): Promise<{
    podUrl?: string
    error?: string
  }> {
    try {
      const profileDataset = await getSolidDataset(webId, {
        fetch: this.session.fetch,
      })
      
      const profile = getThing(profileDataset, webId)
      if (!profile) {
        return { error: "Profile not found" }
      }

      // Get storage locations
      const storages = getUrl(profile, "http://www.w3.org/ns/pim/space#storage")
      
      if (storages) {
        return { podUrl: storages }
      }

      return { error: "No storage location found in profile" }
    } catch (error) {
      return { error: `Failed to fetch profile: ${error}` }
    }
  }

  /**
   * Get user profile information from pod
   */
  async getProfile(webId: string): Promise<PodProfile | null> {
    try {
      const profileDataset = await getSolidDataset(webId, {
        fetch: this.session.fetch,
      })
      
      const profile = getThing(profileDataset, webId)
      if (!profile) return null

      const name = getStringNoLocale(profile, FOAF.name) || 
                   getStringNoLocale(profile, VCARD.fn)
      const email = getStringNoLocale(profile, VCARD.hasEmail)
      const storageUrls = getUrl(profile, "http://www.w3.org/ns/pim/space#storage")
      
      return {
        webId,
        name,
        email,
        storage: storageUrls ? [storageUrls] : [],
      }
    } catch (error) {
      console.error("Failed to get profile:", error)
      return null
    }
  }

  /**
   * List resources in a container
   */
  async listResources(containerUrl: string): Promise<PodResource[]> {
    try {
      const dataset = await getSolidDataset(containerUrl, {
        fetch: this.session.fetch,
      })

      const things = getThingAll(dataset)
      const resources: PodResource[] = []

      for (const thing of things) {
        const url = getSourceUrl(thing)
        const types = getUrl(thing, RDF.type)
        
        // Skip containers for now, focus on files
        if (types?.includes("http://www.w3.org/ns/ldp#Container")) {
          continue
        }

        const name = url.split("/").pop() || url
        resources.push({
          url,
          name,
          type: "file",
        })
      }

      return resources
    } catch (error) {
      console.error("Failed to list resources:", error)
      return []
    }
  }

  /**
   * Upload a file to pod
   */
  async uploadFile(
    targetUrl: string,
    file: File,
    contentType?: string
  ): Promise<{ success: boolean; error?: string; url?: string }> {
    try {
      const savedFile = await overwriteFile(
        targetUrl,
        file,
        {
          contentType: contentType || file.type,
          fetch: this.session.fetch,
        }
      )

      return { success: true, url: getSourceUrl(savedFile) }
    } catch (error) {
      return { success: false, error: `Upload failed: ${error}` }
    }
  }

  /**
   * Download a file from pod
   */
  async downloadFile(fileUrl: string): Promise<{
    blob?: Blob
    contentType?: string
    error?: string
  }> {
    try {
      const file = await getFile(fileUrl, { fetch: this.session.fetch })
      
      if (isRawData(file)) {
        return {
          blob: file,
          contentType: getContentType(file) || undefined,
        }
      }

      return { error: "Resource is not a file" }
    } catch (error) {
      return { error: `Download failed: ${error}` }
    }
  }

  /**
   * Delete a resource from pod
   */
  async deleteResource(resourceUrl: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      await deleteFile(resourceUrl, { fetch: this.session.fetch })
      return { success: true }
    } catch (error) {
      return { success: false, error: `Delete failed: ${error}` }
    }
  }

  /**
   * Set access control for a resource
   */
  async setResourceAccess(
    resourceUrl: string,
    webId: string,
    access: {
      read?: boolean
      write?: boolean
      append?: boolean
      control?: boolean
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await universalAccess.setAgentAccess(
        resourceUrl,
        webId,
        access,
        { fetch: this.session.fetch }
      )
      return { success: true }
    } catch (error) {
      return { success: false, error: `Failed to set access: ${error}` }
    }
  }

  /**
   * Create a container in pod
   */
  async createContainer(
    parentUrl: string,
    name: string
  ): Promise<{ success: boolean; error?: string; url?: string }> {
    try {
      const containerUrl = `${parentUrl}${name}/`
      const dataset = createSolidDataset()
      
      const savedDataset = await saveSolidDatasetAt(
        containerUrl,
        dataset,
        { fetch: this.session.fetch }
      )

      return { success: true, url: getSourceUrl(savedDataset) }
    } catch (error) {
      return { success: false, error: `Failed to create container: ${error}` }
    }
  }
}