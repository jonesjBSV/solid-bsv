import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch as solidFetch,
  logout,
} from "@inrupt/solid-client-authn-browser"
import { Session } from "@inrupt/solid-client-authn-browser"

export interface SolidAuthConfig {
  clientId?: string
  redirectUrl: string
  oidcIssuer: string
}

export class SolidSessionManager {
  private static instance: SolidSessionManager
  private session: Session

  private constructor() {
    this.session = getDefaultSession()
  }

  static getInstance(): SolidSessionManager {
    if (!SolidSessionManager.instance) {
      SolidSessionManager.instance = new SolidSessionManager()
    }
    return SolidSessionManager.instance
  }

  /**
   * Login to SOLID Pod
   */
  async login(config: SolidAuthConfig): Promise<void> {
    await login({
      oidcIssuer: config.oidcIssuer,
      redirectUrl: config.redirectUrl,
      clientId: config.clientId,
      clientName: "SOLID+BSV Application",
      handleRedirect: "redirect",
    })
  }

  /**
   * Handle redirect after login
   */
  async handleRedirect(
    url?: string
  ): Promise<{ isLoggedIn: boolean; webId?: string }> {
    const info = await handleIncomingRedirect(url)
    
    if (info?.isLoggedIn && info.webId) {
      return {
        isLoggedIn: true,
        webId: info.webId,
      }
    }

    return { isLoggedIn: false }
  }

  /**
   * Logout from SOLID Pod
   */
  async logout(): Promise<void> {
    await logout()
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return this.session.info
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.session.info.isLoggedIn === true
  }

  /**
   * Get authenticated fetch function
   */
  getAuthenticatedFetch() {
    return this.session.fetch
  }

  /**
   * Get current session
   */
  getSession(): Session {
    return this.session
  }

  /**
   * Store access token securely (for server-side usage)
   */
  async storeAccessToken(token: string, webId: string): Promise<void> {
    // In a real implementation, this would store the token securely
    // For now, we'll use session storage (client-side only)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`solid_token_${webId}`, token)
    }
  }

  /**
   * Retrieve stored access token
   */
  async getStoredAccessToken(webId: string): Promise<string | null> {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`solid_token_${webId}`)
    }
    return null
  }

  /**
   * Clear stored access token
   */
  async clearStoredAccessToken(webId: string): Promise<void> {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`solid_token_${webId}`)
    }
  }
}