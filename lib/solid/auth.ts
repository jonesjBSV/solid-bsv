/**
 * > **⚠️ BSV SPV ARCHITECTURE REQUIREMENTS**
 * > 
 * > This implementation strictly follows BSV SPV (Simplified Payment Verification) architecture:
 * > - **NO HD Wallets or key management** - Users bring existing BRC-100 wallets
 * > - **ProtoWallet for app operations** - App manages internal transactions only
 * > - **WalletClient for user interactions** - Users sign with their own wallets
 * > - **BSV SPV verification** - Use merkle proofs, not full blockchain validation
 * > - **BSV overlay integration** - Publish to overlay topics, not P2P networks
 * > - See `BSV_SPV_ARCHITECTURE_REQUIREMENTS.md` for complete guidelines
 */

import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch,
  Session,
} from "@inrupt/solid-client-authn-browser"
import {
  getSolidDataset,
  getThing,
  getUrlAll,
  getStringNoLocale,
  getDatetime,
  SolidDataset,
} from "@inrupt/solid-client"
import { FOAF, RDF, VCARD } from "@inrupt/vocab-common-rdf"

export interface SolidProfile {
  webId: string
  name?: string
  nickname?: string
  image?: string
  podUrl?: string
  storageAll: string[]
}

export interface SolidSession {
  info: {
    webId?: string
    isLoggedIn: boolean
  }
  fetch: typeof fetch
  logout: () => Promise<void>
}

/**
 * Get SOLID auth configuration for environment
 */
export const getSolidAuthConfig = () => ({
  clientId: process.env.NEXT_PUBLIC_SOLID_CLIENT_ID || "solid-bsv-app",
  redirectUrl: process.env.NEXT_PUBLIC_SOLID_REDIRECT_URL || `${window.location.origin}/api/solid/callback`,
  oidcIssuer: process.env.NEXT_PUBLIC_SOLID_OIDC_ISSUER || "https://login.inrupt.com",
  clientName: "SOLID+BSV Second Brain",
  clientUri: window.location.origin,
})

/**
 * Login to SOLID Pod using OIDC
 */
export const loginToSolid = async (oidcIssuer?: string) => {
  const config = getSolidAuthConfig()
  
  await login({
    oidcIssuer: oidcIssuer || config.oidcIssuer,
    redirectUrl: config.redirectUrl,
    clientId: config.clientId,
    clientName: config.clientName,
    clientUri: config.clientUri,
  })
}

/**
 * Handle redirect after SOLID login
 */
export const handleSolidRedirect = async (): Promise<Session | null> => {
  const session = await handleIncomingRedirect({
    restorePreviousSession: true,
  })
  
  if (session?.info?.isLoggedIn) {
    return session
  }
  
  return null
}

/**
 * Get current SOLID session
 */
export const getSolidSession = async (): Promise<SolidSession | null> => {
  const session = await getDefaultSession()
  
  if (!session?.info?.isLoggedIn) {
    return null
  }
  
  return session as SolidSession
}

/**
 * Logout from SOLID Pod
 */
export const logoutFromSolid = async () => {
  const session = await getSolidSession()
  if (session) {
    await session.logout()
  }
}

/**
 * Get user profile from SOLID Pod
 */
export const getSolidProfile = async (webId: string, solidFetch?: typeof fetch): Promise<SolidProfile | null> => {
  try {
    const fetchFn = solidFetch || fetch
    const profileDataset = await getSolidDataset(webId, { fetch: fetchFn })
    const profileThing = getThing(profileDataset, webId)
    
    if (!profileThing) {
      return null
    }
    
    // Extract profile information
    const name = getStringNoLocale(profileThing, FOAF.name) || 
                 getStringNoLocale(profileThing, VCARD.fn)
    const nickname = getStringNoLocale(profileThing, FOAF.nick)
    const images = getUrlAll(profileThing, FOAF.img).concat(
      getUrlAll(profileThing, VCARD.hasPhoto)
    )
    const storageAll = getUrlAll(profileThing, "http://www.w3.org/ns/pim/space#storage")
    
    return {
      webId,
      name,
      nickname,
      image: images[0],
      podUrl: storageAll[0],
      storageAll,
    }
  } catch (error) {
    console.error("Error fetching SOLID profile:", error)
    return null
  }
}

/**
 * Check if a resource exists in the pod
 */
export const checkResourceExists = async (
  resourceUrl: string,
  solidFetch: typeof fetch
): Promise<boolean> => {
  try {
    const response = await solidFetch(resourceUrl, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Create a container in the pod
 */
export const createContainer = async (
  containerUrl: string,
  solidFetch: typeof fetch
): Promise<boolean> => {
  try {
    // First check if it already exists
    const exists = await checkResourceExists(containerUrl, solidFetch)
    if (exists) {
      return true
    }
    
    // Create the container
    const response = await solidFetch(containerUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "text/turtle",
      },
      body: "",
    })
    
    return response.ok || response.status === 201
  } catch (error) {
    console.error("Error creating container:", error)
    return false
  }
}

/**
 * Initialize pod structure for the app
 */
export const initializePodStructure = async (
  podUrl: string,
  solidFetch: typeof fetch
): Promise<boolean> => {
  try {
    // Create main app container
    const appContainer = `${podUrl}solid-bsv/`
    await createContainer(appContainer, solidFetch)
    
    // Create sub-containers
    const containers = [
      "resources/",
      "contexts/",
      "identity/",
      "attestations/",
      "shared/",
    ]
    
    for (const container of containers) {
      await createContainer(`${appContainer}${container}`, solidFetch)
    }
    
    return true
  } catch (error) {
    console.error("Error initializing pod structure:", error)
    return false
  }
}

/**
 * Get user's pod storage URLs
 */
export const getPodStorageUrls = async (
  webId: string,
  solidFetch: typeof fetch
): Promise<string[]> => {
  const profile = await getSolidProfile(webId, solidFetch)
  return profile?.storageAll || []
}