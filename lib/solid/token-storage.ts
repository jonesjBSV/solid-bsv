import { createClient } from '@/utils/supabase/server'
import { encrypt, decrypt } from '@/lib/utils/encryption'

/**
 * Secure token storage service for SOLID access tokens
 * Encrypts tokens before storing in the database
 */
export class SolidTokenStorage {
  /**
   * Store an encrypted access token for a user
   */
  static async storeToken(
    userId: string,
    webId: string,
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      // Encrypt the access token
      const encryptedToken = await encrypt(accessToken)
      
      const { error } = await supabase
        .from('identity')
        .update({
          access_token: encryptedToken,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      
      if (error) {
        console.error('Failed to store encrypted token:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Token storage error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to store token',
      }
    }
  }

  /**
   * Retrieve and decrypt an access token for a user
   */
  static async getToken(
    userId: string
  ): Promise<{ token?: string; error?: string }> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('identity')
        .select('access_token')
        .eq('user_id', userId)
        .eq('connection_status', 'connected')
        .single()
      
      if (error) {
        console.error('Failed to retrieve token:', error)
        return { error: error.message }
      }
      
      if (!data?.access_token) {
        return { error: 'No access token found' }
      }
      
      // Decrypt the access token
      const decryptedToken = await decrypt(data.access_token)
      
      return { token: decryptedToken }
    } catch (error) {
      console.error('Token retrieval error:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to retrieve token',
      }
    }
  }

  /**
   * Remove stored access token for a user
   */
  static async removeToken(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('identity')
        .update({
          access_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      
      if (error) {
        console.error('Failed to remove token:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Token removal error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove token',
      }
    }
  }

  /**
   * Refresh an access token (for when tokens expire)
   */
  static async refreshToken(
    userId: string,
    refreshToken: string
  ): Promise<{ accessToken?: string; error?: string }> {
    try {
      // In a real implementation, this would use the SOLID OIDC flow
      // to refresh the access token using the refresh token
      
      // For now, we'll return an error as this is not implemented
      return { error: 'Token refresh not implemented yet' }
    } catch (error) {
      console.error('Token refresh error:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      }
    }
  }

  /**
   * Validate that a stored token is still valid
   */
  static async validateToken(
    userId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      const { token, error } = await this.getToken(userId)
      
      if (error || !token) {
        return { isValid: false, error: error || 'No token found' }
      }
      
      // In a real implementation, this would make a test request
      // to the SOLID pod to verify the token is still valid
      
      // For now, we'll assume the token is valid if it exists
      return { isValid: true }
    } catch (error) {
      console.error('Token validation error:', error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to validate token',
      }
    }
  }
}