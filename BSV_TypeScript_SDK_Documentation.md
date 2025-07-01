# BSV TypeScript SDK Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Modules Documentation](#modules-documentation)
   - [Primitives](#primitives)
   - [Transaction](#transaction)
   - [Wallet](#wallet)
   - [Auth](#auth)
   - [Script](#script)
   - [Overlay Tools](#overlay-tools)
   - [Messages](#messages)
   - [Compat](#compat)
   - [Storage](#storage)
   - [KVStore](#kvstore)
   - [Identity](#identity)
   - [Registry](#registry)
   - [TOTP](#totp)
4. [Integration with SOLID Pod + BSV Application](#integration-with-solid-pod--bsv-application)
5. [Usage Examples](#usage-examples)

## Overview

The BSV TypeScript SDK (@bsv/sdk) is a comprehensive development toolkit designed to provide a unified layer for building scalable applications on the BSV Blockchain. It addresses the limitations of previous tools by offering a fresh, peer-to-peer approach, adhering to SPV (Simplified Payment Verification), and ensuring privacy and scalability.

### Key Features

- **Sound Cryptographic Primitives**: Secure key management, signature computations, and encryption protocols
- **Script Level Constructs**: Network-compliant script interpreter with support for custom scripts
- **Transaction Construction and Signing**: Comprehensive transaction builder API
- **Transaction Broadcast Management**: Mechanisms to send transactions to miners and overlays
- **Merkle Proof Verification**: Tools for representing and verifying merkle proofs
- **Serializable SPV Structures**: Full SPV verification support
- **P2P Authentication**: Robust peer-to-peer authentication mechanisms
- **Identity Management**: Comprehensive identity verification and certificate management
- **Distributed Storage**: Scalable and secure distributed data storage solutions
- **Wallet Interface**: Standardized interface for wallet operations

## Architecture

The SDK follows a modular architecture with clear separation of concerns:

- **Core Layer** (primitives): Cryptographic building blocks and mathematical operations
- **Protocol Layer** (script, transaction): Bitcoin protocol implementation
- **Application Layer** (wallet, auth, identity): High-level application interfaces
- **Integration Layer** (overlay-tools, storage, messages): External service integrations
- **Compatibility Layer** (compat): Legacy system support

## Modules Documentation

### Primitives

**Purpose**: Provides cryptographic building blocks and mathematical operations required for Bitcoin operations.

**Key Classes**:

- **BigNumber**: Extended precision arithmetic for 256-bit cryptography
- **PrivateKey**: Private key management with signing capabilities
- **PublicKey**: Public key operations and verification
- **Curve**: Elliptic curve cryptography implementation
- **Hash**: Various hashing algorithms (SHA256, RIPEMD160, etc.)
- **SymmetricKey**: AES-GCM symmetric encryption
- **ECDSA**: Digital signature algorithms
- **Schnorr**: Schnorr signature implementation

**Main Features**:
- Key generation and derivation
- Digital signatures (ECDSA and Schnorr)
- Hash functions and HMAC
- Symmetric encryption/decryption
- Big number arithmetic
- Elliptic curve operations

**Usage Example**:
```typescript
import { PrivateKey, PublicKey, sha256 } from '@bsv/sdk'

// Generate a private key
const privateKey = PrivateKey.fromRandom()

// Get the corresponding public key
const publicKey = privateKey.toPublicKey()

// Sign a message
const message = new TextEncoder().encode('Hello BSV')
const signature = privateKey.sign(Array.from(message))

// Verify signature
const isValid = publicKey.verify(Array.from(message), signature)
```

**Integration Points**: Foundation for all other modules, provides cryptographic primitives used throughout the SDK.

### Transaction

**Purpose**: Handles Bitcoin transaction construction, signing, broadcasting, and verification.

**Key Classes**:

- **Transaction**: Main transaction class with inputs/outputs
- **TransactionInput**: Transaction input representation
- **TransactionOutput**: Transaction output representation
- **MerklePath**: Merkle proof verification
- **Beef**: Binary Extensible Exchange Format for transactions
- **ARC**: Advanced transaction broadcasting
- **FeeModel**: Transaction fee calculation

**Main Features**:
- Transaction construction and serialization
- Input/output management
- Digital signing of transactions
- Fee estimation and optimization
- Broadcasting to miners and overlay networks
- SPV verification with merkle proofs
- BUMP (Bitcoin Unified Merkle Path) support

**Usage Example**:
```typescript
import { Transaction, P2PKH, PrivateKey } from '@bsv/sdk'

const privateKey = PrivateKey.fromWif('your-wif-key')

const tx = new Transaction(1, [
  {
    sourceTransaction: prevTx,
    sourceOutputIndex: 0,
    unlockingScriptTemplate: new P2PKH().unlock(privateKey)
  }
], [
  {
    lockingScript: new P2PKH().lock(publicKeyHash),
    satoshis: 1000
  }
])

await tx.fee()
await tx.sign()
await tx.broadcast()
```

**Integration Points**: Core for wallet operations, used by auth for payments, integrates with overlay-tools for broadcasting.

### Wallet

**Purpose**: Provides standardized wallet interface for key management and transaction operations.

**Key Interfaces**:

- **WalletInterface**: Standard wallet operations interface
- **WalletClient**: Client for communicating with wallets
- **KeyDeriver**: Hierarchical key derivation
- **ProtoWallet**: Protocol wallet implementation

**Main Features**:
- Hierarchical Deterministic (HD) key derivation
- Multi-signature support
- Certificate management
- Action-based transaction management
- Secure key storage and access
- Cross-platform wallet communication

**Usage Example**:
```typescript
import { WalletClient } from '@bsv/sdk'

const wallet = new WalletClient()

// Create a transaction
const result = await wallet.createAction({
  description: 'Send payment',
  outputs: [{
    script: lockingScript.toHex(),
    satoshis: 1000
  }]
})

// Sign the transaction
await wallet.signAction({
  reference: result.reference,
  spends: result.spends
})
```

**Integration Points**: Central to most SDK operations, used by auth, identity, storage, and registry modules.

### Auth

**Purpose**: Provides mutual authentication and service monetization framework with certificate-based identity verification.

**Key Classes**:

- **Peer**: Peer-to-peer communication management
- **SessionManager**: Session state management
- **Certificate**: Digital certificate handling
- **AuthFetch**: Authenticated HTTP client
- **VerifiableCertificate**: Certificate verification

**Main Features**:
- Peer-to-peer authentication
- Certificate-based identity verification
- Session management
- Secure communication channels
- Automatic payment handling (402 Payment Required)
- Service monetization

**Usage Example**:
```typescript
import { AuthFetch, WalletClient } from '@bsv/sdk'

const wallet = new WalletClient()
const authFetch = new AuthFetch(wallet)

// Make authenticated request
const response = await authFetch.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
```

**Integration Points**: Works with wallet for payments, uses primitives for cryptography, integrates with identity for certificates.

### Script

**Purpose**: Bitcoin script construction, execution, and template system for common script patterns.

**Key Classes**:

- **Script**: Base script class with parsing and execution
- **LockingScript**: Output scripts that lock funds
- **UnlockingScript**: Input scripts that unlock funds
- **P2PKH**: Pay-to-Public-Key-Hash template
- **PushDrop**: Custom script template for data storage
- **Spend**: Script interpreter and execution engine

**Main Features**:
- Script parsing and serialization
- Template system for common patterns
- Script execution and validation
- Custom script creation
- Opcode support and validation

**Usage Example**:
```typescript
import { P2PKH, PrivateKey } from '@bsv/sdk'

const privateKey = PrivateKey.fromRandom()
const p2pkh = new P2PKH()

// Create locking script
const lockingScript = p2pkh.lock(privateKey.toAddress())

// Create unlocking script template
const unlockingTemplate = p2pkh.unlock(privateKey)
```

**Integration Points**: Used by transaction module for script creation, essential for wallet operations.

### Overlay Tools

**Purpose**: Advanced tools for overlay network management and optimization, enabling topic-based transaction broadcasting and distributed token lookups.

**Key Classes**:

- **LookupResolver**: Resolves tokens and data via overlay networks
- **SHIPBroadcaster**: Broadcast transactions to overlay services
- **OverlayAdminTokenTemplate**: Administrative overlay tokens

**Main Features**:
- Topic-based transaction broadcasting
- Distributed token lookup and resolution
- Overlay network service integration
- SLAP (Service Location Advertisement Protocol) support
- SHIP (Simplified HTTP Interface Protocol) broadcasting

**Usage Example**:
```typescript
import { SHIPBroadcaster } from '@bsv/sdk'

const broadcaster = new SHIPBroadcaster({
  topic: 'my-app-topic',
  serviceUrl: 'https://overlay.example.com'
})

// Broadcast to overlay network
await broadcaster.broadcast(transaction)
```

**Integration Points**: Extends transaction broadcasting, works with storage for distributed data, used by identity for certificate publishing.

### Messages

**Purpose**: Provides secure message encryption, decryption, signing, and verification capabilities between parties.

**Key Functions**:

- **encrypt**: Encrypt messages between sender and recipient
- **decrypt**: Decrypt received messages
- **sign**: Create signed messages
- **verify**: Verify message signatures

**Main Features**:
- End-to-end message encryption
- Digital message signing
- Key derivation for messaging
- Ephemeral key support
- Anyone-can-verify signatures

**Usage Example**:
```typescript
import { encrypt, decrypt, sign, verify, PrivateKey } from '@bsv/sdk'

const senderKey = PrivateKey.fromRandom()
const recipientKey = PrivateKey.fromRandom()
const message = new TextEncoder().encode('Secret message')

// Encrypt message
const encrypted = encrypt(Array.from(message), senderKey, recipientKey.toPublicKey())

// Decrypt message
const decrypted = decrypt(encrypted, recipientKey)

// Sign message
const signed = sign(Array.from(message), senderKey)

// Verify signature
const isValid = verify(Array.from(message), signed)
```

**Integration Points**: Uses primitives for cryptography, can be used with wallet for secure communications.

### Compat

**Purpose**: Provides compatibility layer for legacy Bitcoin systems and deprecated functionality.

**Key Classes**:

- **ECIES**: Elliptic Curve Integrated Encryption Scheme (legacy)
- **HD**: Hierarchical Deterministic key derivation (BIP32)
- **Mnemonic**: BIP39 mnemonic phrase support
- **BSM**: Bitcoin Signed Message format

**Main Features**:
- BIP32 hierarchical deterministic keys
- BIP39 mnemonic seed phrases
- Legacy ECIES encryption/decryption
- Bitcoin Signed Message compatibility
- Electrum and Bitcore compatibility

**Usage Example**:
```typescript
import { Mnemonic, HD } from '@bsv/sdk'

// Generate mnemonic
const mnemonic = Mnemonic.fromRandom()

// Derive keys from mnemonic
const seed = mnemonic.toSeed()
const hdKey = HD.fromSeed(seed)
const childKey = hdKey.derive('m/44\'/0\'/0\'/0/0')
```

**Integration Points**: Provides legacy support for older applications, used when migrating from older Bitcoin libraries.

### Storage

**Purpose**: Distributed storage client for storing and retrieving data from distributed data storage services using UHRP (Universal Hash Resource Protocol).

**Key Classes**:

- **StorageUploader**: Upload files to distributed storage
- **StorageDownloader**: Download files from distributed storage
- **StorageUtils**: Utility functions for storage operations

**Main Features**:
- UHRP-based content addressing
- File upload with retention periods
- Content-addressed file retrieval
- Hash-based integrity verification
- Metadata management
- Storage service abstraction

**Usage Example**:
```typescript
import { StorageUploader, StorageDownloader, WalletClient } from '@bsv/sdk'

const wallet = new WalletClient()
const uploader = new StorageUploader({
  storageURL: 'https://storage.example.com',
  wallet
})

// Upload file
const file = { data: [1,2,3,4], type: 'application/octet-stream' }
const result = await uploader.publishFile({
  file,
  retentionPeriod: 1440 // 24 hours in minutes
})

// Download file
const downloader = new StorageDownloader()
const downloadResult = await downloader.download(result.uhrpURL)
```

**Integration Points**: Uses wallet for payments, integrates with overlay-tools for distributed publishing.

### KVStore

**Purpose**: Distributed key-value store backed by blockchain transactions, providing persistent data storage.

**Key Classes**:

- **LocalKVStore**: Blockchain-backed key-value storage

**Main Features**:
- Persistent key-value storage on blockchain
- Optional encryption of values
- Atomic operations
- Transaction-based consistency
- Collision resolution
- Context-based namespacing

**Usage Example**:
```typescript
import { LocalKVStore, WalletClient } from '@bsv/sdk'

const wallet = new WalletClient()
const kvstore = new LocalKVStore(wallet, 'my-app-context', true)

// Set a value
const outpoint = await kvstore.set('user-preference', 'dark-mode')

// Get a value
const value = await kvstore.get('user-preference', 'light-mode')

// Remove a value
await kvstore.remove('user-preference')
```

**Integration Points**: Uses wallet for transaction management, relies on script templates for storage.

### Identity

**Purpose**: Comprehensive identity management system supporting identity verification and certificate management.

**Key Classes**:

- **IdentityClient**: Identity resolution and management

**Main Features**:
- Identity certificate resolution
- Public attribute revelation
- Identity verification
- Certificate-based identity lookup
- Attribute-based discovery
- Trusted certifier integration

**Usage Example**:
```typescript
import { IdentityClient, WalletClient } from '@bsv/sdk'

const wallet = new WalletClient()
const identity = new IdentityClient(wallet)

// Resolve identity by key
const identities = await identity.resolveByIdentityKey({
  identityKey: 'public-key-hex',
  certifiers: ['trusted-certifier-key']
})

// Publicly reveal attributes
await identity.publiclyRevealAttributes(certificate, ['name', 'email'])
```

**Integration Points**: Uses wallet for certificate management, integrates with auth for verification, uses overlay-tools for publishing.

### Registry

**Purpose**: Protocol registry for managing canonical references to protocols, baskets, and certificate types.

**Key Classes**:

- **RegistryClient**: Manages protocol and certificate definitions

**Main Features**:
- Protocol definition registration
- Basket definition management
- Certificate schema registration
- Distributed lookup of definitions
- Registry entry revocation
- Canonical reference establishment

**Usage Example**:
```typescript
import { RegistryClient, WalletClient } from '@bsv/sdk'

const wallet = new WalletClient()
const registry = new RegistryClient(wallet)

// Register a protocol definition
await registry.registerDefinition({
  definitionType: 'protocol',
  protocolID: [1, 'my-protocol'],
  name: 'My Protocol',
  description: 'A custom protocol',
  iconURL: 'https://example.com/icon.png',
  documentationURL: 'https://docs.example.com'
})

// Resolve protocols
const protocols = await registry.resolve('protocol', {
  name: 'My Protocol'
})
```

**Integration Points**: Uses wallet for transaction management, integrates with overlay-tools for publishing definitions.

### TOTP

**Purpose**: Time-based One-Time Password implementation for secure authentication across unsecured mediums.

**Key Classes**:

- **TOTP**: Time-based OTP generation and validation

**Main Features**:
- RFC 6238 compliant TOTP generation
- Configurable algorithms (SHA-1, SHA-256, SHA-512)
- Customizable time periods and digits
- Validation with time skew tolerance
- Secure secret key management

**Usage Example**:
```typescript
import { TOTP } from '@bsv/sdk'

const secret = new Array(32).fill(0).map(() => Math.floor(Math.random() * 256))

// Generate TOTP
const otp = TOTP.generate(secret, {
  digits: 6,
  period: 30,
  algorithm: 'SHA-256'
})

// Validate TOTP
const isValid = TOTP.validate(secret, otp, {
  digits: 6,
  period: 30,
  algorithm: 'SHA-256',
  skew: 1 // Allow 1 time period tolerance
})
```

**Integration Points**: Can be used with auth for enhanced security, integrates with wallet for secure secret storage.

## Integration with SOLID Pod + BSV Application

The BSV SDK provides several integration points that are particularly relevant for SOLID Pod applications:

### 1. **Identity and Authentication**
- Use the **Identity** module to establish verifiable identities linked to BSV keys
- Integrate **Auth** module for peer-to-peer authentication between SOLID pods
- Leverage **Certificate** system for establishing trust relationships

### 2. **Distributed Storage**
- Replace traditional HTTP-based storage with BSV **Storage** module
- Use content-addressed storage for immutable data references
- Integrate with SOLID's data access patterns using UHRP URLs

### 3. **Access Control and Permissions**
- Use **Messages** module for encrypted communication between pods
- Implement fine-grained access control using BSV transactions
- Use **TOTP** for additional authentication layers

### 4. **Data Persistence**
- Use **KVStore** for persistent application state
- Store SOLID Pod metadata and configurations on-chain
- Implement versioning and change tracking using transactions

### 5. **Service Discovery and Registry**
- Use **Registry** module to register and discover SOLID services
- Implement protocol-based service definitions
- Enable decentralized service discovery without central authorities

## Usage Examples

### Complete Application Example

```typescript
import {
  WalletClient,
  PrivateKey,
  Transaction,
  P2PKH,
  LocalKVStore,
  IdentityClient,
  StorageUploader,
  encrypt,
  decrypt
} from '@bsv/sdk'

class SOLIDPodApplication {
  private wallet: WalletClient
  private kvstore: LocalKVStore
  private identity: IdentityClient
  private storage: StorageUploader

  constructor() {
    this.wallet = new WalletClient()
    this.kvstore = new LocalKVStore(this.wallet, 'solid-pod-app')
    this.identity = new IdentityClient(this.wallet)
    this.storage = new StorageUploader({
      storageURL: 'https://storage.example.com',
      wallet: this.wallet
    })
  }

  // Store encrypted data in SOLID pod
  async storePrivateData(key: string, data: any, recipientPublicKey?: string) {
    const jsonData = JSON.stringify(data)
    let finalData = jsonData

    if (recipientPublicKey) {
      // Encrypt for specific recipient
      const senderKey = PrivateKey.fromRandom() // Or derive from wallet
      const encrypted = encrypt(
        Array.from(new TextEncoder().encode(jsonData)),
        senderKey,
        PublicKey.fromString(recipientPublicKey)
      )
      finalData = Buffer.from(encrypted).toString('base64')
    }

    // Store in KV store
    return await this.kvstore.set(key, finalData)
  }

  // Retrieve and decrypt data
  async getPrivateData(key: string, senderPublicKey?: string): Promise<any> {
    const data = await this.kvstore.get(key)
    if (!data) return null

    let finalData = data
    if (senderPublicKey) {
      // Decrypt from sender
      const recipientKey = PrivateKey.fromRandom() // Or derive from wallet
      const encryptedArray = Array.from(Buffer.from(data, 'base64'))
      const decrypted = decrypt(encryptedArray, recipientKey)
      finalData = new TextDecoder().decode(new Uint8Array(decrypted))
    }

    return JSON.parse(finalData)
  }

  // Upload file to distributed storage
  async uploadFile(file: ArrayBuffer, mimeType: string) {
    const uploadableFile = {
      data: Array.from(new Uint8Array(file)),
      type: mimeType
    }

    return await this.storage.publishFile({
      file: uploadableFile,
      retentionPeriod: 10080 // 1 week
    })
  }

  // Establish identity
  async establishIdentity(name: string, email: string) {
    // This would typically involve getting certificates from trusted certifiers
    return await this.identity.publiclyRevealAttributes(certificate, ['name', 'email'])
  }
}

// Usage
const app = new SOLIDPodApplication()

// Store private user preferences
await app.storePrivateData('preferences', {
  theme: 'dark',
  language: 'en'
})

// Upload a file
const fileBuffer = new ArrayBuffer(1024)
const result = await app.uploadFile(fileBuffer, 'application/pdf')
console.log('File uploaded to:', result.uhrpURL)
```

This comprehensive documentation provides a complete reference for using the BSV TypeScript SDK in your SOLID Pod + BSV application, covering all the major modules and their integration points for building decentralized, blockchain-based applications.