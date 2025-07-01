// BSV Identity Service - DID and Verifiable Credential Management
// Following BSV SPV architecture with did:bsv method

import { Hash } from '@bsv/sdk'
import { ProtoWallet } from './proto-wallet'
import { NotarizationService } from './notarization-service'

export interface DIDDocument {
  id: string // did:bsv:address
  publicKey: string[]
  authentication: string[]
  service: ServiceEndpoint[]
  bsvTimestamp?: {
    txHash: string
    blockHeight: number
    timestamp: Date
    merkleProof?: any // BUMP format
  }
  solidWebId?: string
}

export interface ServiceEndpoint {
  id: string
  type: string
  serviceEndpoint: string
}

export interface VerifiableCredential {
  id: string
  type: string[]
  issuer: string
  issuanceDate: Date
  credentialSubject: any
  proof?: {
    type: string
    created: Date
    proofPurpose: string
    verificationMethod: string
    jws?: string
  }
}

export interface IdentityConfig {
  method: 'bsv'
  network: 'mainnet' | 'testnet'
}

export class IdentityService {
  private config: IdentityConfig
  private appWallet: ProtoWallet
  private notarizationService: NotarizationService

  constructor(config: IdentityConfig) {
    this.config = config
    this.appWallet = new ProtoWallet({ network: config.network })
    this.notarizationService = new NotarizationService(this.appWallet)
  }

  // Create a new DID document
  async createDID(params: {
    publicKey: string
    solidWebId?: string
    services?: ServiceEndpoint[]
  }): Promise<DIDDocument> {
    try {
      // Generate DID from public key (not address for privacy)
      const didId = `did:${this.config.method}:${params.publicKey.slice(0, 16)}`
      
      const didDocument: DIDDocument = {
        id: didId,
        publicKey: [params.publicKey],
        authentication: [didId + '#key-1'],
        service: params.services || [],
        solidWebId: params.solidWebId,
      }

      // Add SOLID pod service if WebID provided
      if (params.solidWebId) {
        didDocument.service.push({
          id: '#solid-pod',
          type: 'SolidPodService',
          serviceEndpoint: params.solidWebId,
        })
      }

      return didDocument
    } catch (error) {
      throw new Error(`Failed to create DID: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Timestamp DID document on BSV blockchain
  async timestampDID(didDocument: DIDDocument): Promise<DIDDocument> {
    try {
      // Calculate content hash
      const contentHash = await Hash.sha256(
        Buffer.from(JSON.stringify(didDocument))
      ).toString('hex')

      // Notarize on blockchain
      const notarizationResult = await this.notarizationService.notarizeResource({
        resourceId: didDocument.id,
        resourceType: 'pod_resource', // Using generic type
        contentHash,
        metadata: {
          title: `DID Document: ${didDocument.id}`,
          description: 'Decentralized Identity Document',
          tags: ['did', 'identity', 'bsv'],
          author: didDocument.id,
        },
        overlayTopic: 'tm_did',
        deliveryMethod: 'overlay',
      })

      // Add timestamp to DID document
      didDocument.bsvTimestamp = {
        txHash: notarizationResult.txid,
        blockHeight: 0, // Will be updated when confirmed
        timestamp: new Date(),
        merkleProof: notarizationResult.attestationData.merkleProof,
      }

      return didDocument
    } catch (error) {
      throw new Error(`Failed to timestamp DID: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Resolve DID document
  async resolveDID(did: string): Promise<DIDDocument | null> {
    try {
      // Extract method and identifier
      const parts = did.split(':')
      if (parts.length < 3 || parts[1] !== this.config.method) {
        throw new Error('Invalid DID format')
      }

      // In real implementation, would query overlay network
      // For now, return mock data
      console.log(`Resolving DID: ${did}`)
      
      return null
    } catch (error) {
      console.error('DID resolution failed:', error)
      return null
    }
  }

  // Create a verifiable credential
  async createCredential(params: {
    subject: any
    type: string
    issuerDID: string
    issuerPrivateKey?: string // Only for signing, not stored
  }): Promise<VerifiableCredential> {
    try {
      const credential: VerifiableCredential = {
        id: `vc:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: ['VerifiableCredential', params.type],
        issuer: params.issuerDID,
        issuanceDate: new Date(),
        credentialSubject: params.subject,
      }

      // Add proof if private key provided
      if (params.issuerPrivateKey) {
        credential.proof = {
          type: 'BsvSignature2023',
          created: new Date(),
          proofPurpose: 'assertionMethod',
          verificationMethod: `${params.issuerDID}#key-1`,
          // In real implementation, would create actual signature
          jws: 'mock_signature',
        }
      }

      return credential
    } catch (error) {
      throw new Error(`Failed to create credential: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Timestamp verifiable credential on BSV
  async timestampCredential(credential: VerifiableCredential): Promise<{
    credential: VerifiableCredential
    txHash: string
  }> {
    try {
      // Calculate content hash
      const contentHash = await Hash.sha256(
        Buffer.from(JSON.stringify(credential))
      ).toString('hex')

      // Notarize on blockchain
      const notarizationResult = await this.notarizationService.notarizeResource({
        resourceId: credential.id,
        resourceType: 'pod_resource',
        contentHash,
        metadata: {
          title: `Verifiable Credential: ${credential.type.join(', ')}`,
          description: 'Timestamped credential',
          tags: ['vc', 'credential', credential.type[1]?.toLowerCase()],
          author: credential.issuer,
        },
        overlayTopic: 'tm_vc',
        deliveryMethod: 'overlay',
      })

      return {
        credential,
        txHash: notarizationResult.txid,
      }
    } catch (error) {
      throw new Error(`Failed to timestamp credential: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Verify a credential
  async verifyCredential(
    credential: VerifiableCredential,
    expectedIssuer?: string
  ): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      // Check credential structure
      if (!credential.id || !credential.type || !credential.issuer) {
        errors.push('Invalid credential structure')
      }

      // Check issuer if provided
      if (expectedIssuer && credential.issuer !== expectedIssuer) {
        errors.push('Issuer mismatch')
      }

      // Check issuance date
      const issuanceDate = new Date(credential.issuanceDate)
      if (issuanceDate > new Date()) {
        errors.push('Credential issued in the future')
      }

      // Verify proof if present
      if (credential.proof) {
        // In real implementation, would verify actual signature
        console.log('Verifying credential proof:', credential.proof.type)
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    } catch (error) {
      errors.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        isValid: false,
        errors,
      }
    }
  }

  // Link SOLID WebID with BSV DID
  async linkWebIDToDID(params: {
    solidWebId: string
    bsvDID: string
    publicKey: string
  }): Promise<{
    success: boolean
    attestationTx?: string
  }> {
    try {
      // Create linking attestation
      const linkData = {
        solidWebId: params.solidWebId,
        bsvDID: params.bsvDID,
        publicKey: params.publicKey,
        timestamp: Date.now(),
        version: '1.0',
      }

      const contentHash = await Hash.sha256(
        Buffer.from(JSON.stringify(linkData))
      ).toString('hex')

      // Notarize the link
      const notarizationResult = await this.notarizationService.notarizeResource({
        resourceId: `link_${params.bsvDID}`,
        resourceType: 'pod_resource',
        contentHash,
        metadata: {
          title: 'WebID to DID Link',
          description: `Linking ${params.solidWebId} to ${params.bsvDID}`,
          tags: ['identity', 'solid', 'did', 'link'],
        },
        overlayTopic: 'tm_did',
        deliveryMethod: 'overlay',
      })

      return {
        success: true,
        attestationTx: notarizationResult.txid,
      }
    } catch (error) {
      console.error('Failed to link WebID to DID:', error)
      return {
        success: false,
      }
    }
  }

  // Get identity verification status
  async getVerificationStatus(did: string): Promise<{
    isVerified: boolean
    verificationMethod?: string
    verifiedAt?: Date
  }> {
    try {
      // In real implementation, would check verification records
      console.log(`Checking verification status for: ${did}`)
      
      // Mock verification check
      return {
        isVerified: false,
        verificationMethod: undefined,
        verifiedAt: undefined,
      }
    } catch (error) {
      console.error('Failed to get verification status:', error)
      return {
        isVerified: false,
      }
    }
  }

  // Export DID document as JSON-LD
  exportDIDAsJSONLD(didDocument: DIDDocument): string {
    const jsonld = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/v1',
      ],
      ...didDocument,
    }
    
    return JSON.stringify(jsonld, null, 2)
  }

  // Import DID document from JSON-LD
  importDIDFromJSONLD(jsonld: string): DIDDocument {
    try {
      const parsed = JSON.parse(jsonld)
      
      // Remove @context for internal use
      delete parsed['@context']
      
      return parsed as DIDDocument
    } catch (error) {
      throw new Error('Invalid JSON-LD format')
    }
  }
}