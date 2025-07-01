// BSV SPV Notarization Service following BEEF and Direct Delivery patterns
// This service handles blockchain attestation of SOLID pod resources and context entries

import { Hash } from '@bsv/sdk'
import { ProtoWallet } from './proto-wallet'
import { WalletClient } from './wallet-client'

export interface NotarizationRequest {
  resourceId: string
  resourceType: 'pod_resource' | 'context_entry'
  contentHash: string
  resourceUrl?: string
  metadata?: {
    title?: string
    description?: string
    tags?: string[]
    author?: string
  }
  overlayTopic?: string
  deliveryMethod?: 'direct' | 'overlay'
}

export interface NotarizationResult {
  txid: string
  beef: ArrayBuffer
  contentHash: string
  overlayTopic?: string
  deliveryStatus: 'pending' | 'delivered' | 'confirmed'
  attestationData: {
    resourceId: string
    resourceType: string
    timestamp: number
    merkleProof?: any // BUMP format proof when available
  }
}

export interface OverlayPublication {
  topic: string
  data: {
    resourceId: string
    resourceType: string
    contentHash: string
    txid: string
    timestamp: number
    metadata?: any
    accessPolicy?: {
      type: 'public' | 'payment-required'
      priceSatoshis?: number
    }
  }
}

export class NotarizationService {
  private appWallet: ProtoWallet
  private userWallet: WalletClient | null = null

  constructor(appWallet: ProtoWallet, userWallet?: WalletClient) {
    this.appWallet = appWallet
    this.userWallet = userWallet || null
  }

  /**
   * Notarize a resource using BSV SPV architecture
   * Creates a BEEF transaction with content attestation
   */
  async notarizeResource(request: NotarizationRequest): Promise<NotarizationResult> {
    try {
      // Validate content hash
      if (!request.contentHash || request.contentHash.length !== 64) {
        throw new Error('Valid SHA-256 content hash required')
      }

      // Choose notarization method based on user wallet availability
      if (this.userWallet) {
        return await this.userNotarization(request)
      } else {
        return await this.appNotarization(request)
      }

    } catch (error) {
      console.error('Notarization failed:', error)
      throw new Error(`Notarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * User-initiated notarization (user pays, owns the attestation)
   */
  private async userNotarization(request: NotarizationRequest): Promise<NotarizationResult> {
    if (!this.userWallet) {
      throw new Error('User wallet required for user notarization')
    }

    // Create attestation action for user to sign
    const attestationAction = await this.userWallet.createAction({
      description: `Notarization: ${request.metadata?.title || request.resourceId}`,
      outputs: [{
        protocol: 'pod-notarization',
        lockingScript: await this.createNotarizationScript(request),
        satoshis: 1, // Minimal dust for data carrier
        outputDescription: `Attestation of ${request.resourceType}: ${request.resourceId}`
      }]
    })

    // User signs the action
    const signedAction = await this.userWallet.signAction({
      reference: attestationAction.reference
    })

    // Extract transaction details
    const txid = Hash.sha256(new Uint8Array(signedAction.tx)).toString('hex')

    // Create result object
    const result: NotarizationResult = {
      txid,
      beef: signedAction.tx,
      contentHash: request.contentHash,
      overlayTopic: request.overlayTopic,
      deliveryStatus: 'pending',
      attestationData: {
        resourceId: request.resourceId,
        resourceType: request.resourceType,
        timestamp: Date.now()
      }
    }

    // Handle delivery method
    if (request.deliveryMethod === 'overlay' && request.overlayTopic) {
      await this.publishToOverlay(request, result)
    } else {
      // Direct delivery to notary service
      await this.deliverToNotaryService(result, request)
    }

    return result
  }

  /**
   * App-initiated notarization (app pays, provides service)
   */
  private async appNotarization(request: NotarizationRequest): Promise<NotarizationResult> {
    // App wallet creates and signs attestation
    const attestationTx = await this.appWallet.createAttestation({
      resourceId: request.resourceId,
      contentHash: request.contentHash,
      resourceType: request.resourceType,
      metadata: request.metadata
    })

    const result: NotarizationResult = {
      txid: attestationTx.id,
      beef: new ArrayBuffer(0), // App wallet handles BEEF internally
      contentHash: request.contentHash,
      overlayTopic: request.overlayTopic,
      deliveryStatus: 'pending',
      attestationData: {
        resourceId: request.resourceId,
        resourceType: request.resourceType,
        timestamp: Date.now()
      }
    }

    // Publish to overlay if requested
    if (request.overlayTopic) {
      await this.publishToOverlay(request, result)
    }

    return result
  }

  /**
   * Create notarization locking script with embedded data
   */
  private async createNotarizationScript(request: NotarizationRequest): Promise<string> {
    // Create OP_PUSH_DATA script with attestation data
    const attestationData = {
      protocol: 'solid-pod-notarization',
      version: '1.0',
      resourceId: request.resourceId,
      resourceType: request.resourceType,
      contentHash: request.contentHash,
      timestamp: Date.now(),
      metadata: request.metadata || {}
    }

    // Convert to script format (simplified for demo)
    const dataBuffer = Buffer.from(JSON.stringify(attestationData))
    return `OP_FALSE OP_RETURN ${dataBuffer.toString('hex')}`
  }

  /**
   * Publish attestation to BSV overlay network
   */
  private async publishToOverlay(
    request: NotarizationRequest, 
    result: NotarizationResult
  ): Promise<void> {
    if (!request.overlayTopic) return

    const overlayData: OverlayPublication = {
      topic: request.overlayTopic,
      data: {
        resourceId: request.resourceId,
        resourceType: request.resourceType,
        contentHash: request.contentHash,
        txid: result.txid,
        timestamp: result.attestationData.timestamp,
        metadata: request.metadata,
        accessPolicy: {
          type: 'public' // Could be enhanced with payment requirements
        }
      }
    }

    // In a real implementation, this would connect to actual overlay nodes
    console.log('Publishing to overlay:', overlayData)
    
    // Mock overlay publication
    await this.simulateOverlayPublication(overlayData)
    
    result.deliveryStatus = 'delivered'
  }

  /**
   * Deliver BEEF transaction to notary service
   */
  private async deliverToNotaryService(
    result: NotarizationResult,
    request: NotarizationRequest
  ): Promise<void> {
    // In real implementation, would send to actual notary service
    console.log('Delivering to notary service:', {
      txid: result.txid,
      resourceId: request.resourceId,
      deliveryMethod: 'direct'
    })

    // Mock delivery
    await new Promise(resolve => setTimeout(resolve, 100))
    result.deliveryStatus = 'delivered'
  }

  /**
   * Verify notarization using SPV proof
   */
  async verifyNotarization(txid: string, expectedContentHash: string): Promise<boolean> {
    try {
      // In real implementation, would get merkle proof from SPV
      const merkleProof = await this.getMerkleProof(txid)
      
      if (!merkleProof) {
        return false
      }

      // Verify proof (simplified)
      const isValidProof = await this.verifyMerkleProof(merkleProof)
      
      if (!isValidProof) {
        return false
      }

      // Verify content hash in transaction data
      const txData = await this.getTransactionData(txid)
      return this.verifyContentHashInTransaction(txData, expectedContentHash)

    } catch (error) {
      console.error('Verification failed:', error)
      return false
    }
  }

  /**
   * Calculate content hash for resource
   */
  static async calculateContentHash(content: string | Buffer): Promise<string> {
    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf8') : content
    return Hash.sha256(buffer).toString('hex')
  }

  /**
   * Get overlay topics for different resource types
   */
  static getOverlayTopics(resourceType: string, isPublic: boolean = false): string[] {
    const topics: string[] = []
    
    if (resourceType === 'context_entry') {
      topics.push('tm_context_general')
      if (isPublic) topics.push('tm_context_public')
    } else if (resourceType === 'pod_resource') {
      topics.push('tm_pod_resource')
      if (isPublic) topics.push('tm_pod_public')
    }
    
    // Add generic notarization topic
    topics.push('tm_notarization')
    
    return topics
  }

  // Private helper methods

  private async simulateOverlayPublication(data: OverlayPublication): Promise<void> {
    // Mock implementation - in real app would connect to overlay network
    console.log(`Published to overlay topic "${data.topic}":`, data.data)
  }

  private async getMerkleProof(txid: string): Promise<any> {
    // Mock implementation - in real app would get from SPV wallet
    return {
      txid,
      blockHeight: 800000,
      merkleRoot: 'mock_merkle_root',
      proof: ['mock_proof_element_1', 'mock_proof_element_2']
    }
  }

  private async verifyMerkleProof(proof: any): Promise<boolean> {
    // Mock implementation - in real app would verify using @bsv/sdk
    return proof && proof.txid && proof.merkleRoot
  }

  private async getTransactionData(txid: string): Promise<any> {
    // Mock implementation - in real app would get from SPV wallet or service
    return {
      txid,
      outputs: [
        {
          satoshis: 1,
          script: 'mock_script_with_data'
        }
      ]
    }
  }

  private verifyContentHashInTransaction(txData: any, expectedHash: string): boolean {
    // Mock implementation - in real app would parse OP_RETURN data
    console.log('Verifying content hash in transaction:', txData.txid, expectedHash)
    return true // Simplified verification
  }
}