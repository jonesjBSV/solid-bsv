/**
 * Database Types for SOLID+BSV Second Brain Application
 * Generated from Supabase schema definitions
 */

// NextAuth User Types
export interface User {
  id: string
  name?: string | null
  email?: string | null
  emailVerified?: string | null
  image?: string | null
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
  userId: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  expires: string
  sessionToken: string
  userId: string
  created_at: string
  updated_at: string
}

// SOLID Pod Resource Types
export interface PodResource {
  id: number
  resource_path: string
  resource_type: 'note' | 'document' | 'context' | 'file' | string
  status: 'private' | 'shared' | 'notarized' | 'public'
  bsv_tx_hash?: string | null
  content_hash?: string | null
  resource_size?: number | null
  mime_type?: string | null
  description?: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// Identity & Credentials Types
export interface Identity {
  id: number
  solid_pod_url: string
  connection_status: 'connected' | 'disconnected' | 'error'
  did?: string | null
  did_document?: Record<string, any> | null
  verifiable_credential?: Record<string, any> | null
  did_bsv_tx_hash?: string | null
  vc_bsv_tx_hash?: string | null
  last_sync: string
  access_token_encrypted?: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// BSV Attestation Types
export interface BSVAttestation {
  id: number
  attestation_type: 'did' | 'vc' | 'resource'
  bsv_tx_hash: string
  content_hash: string
  timestamp_proof: Record<string, any>
  resource_id?: number | null
  identity_id?: number | null
  user_id: string
  created_at: string
}

// Context Entry Types (Second Brain)
export interface ContextEntry {
  id: number
  title: string
  content: string
  content_type: 'text' | 'markdown' | 'link' | 'snippet'
  metadata?: Record<string, any> | null
  tags?: string[] | null
  pod_resource_id?: number | null
  bsv_tx_hash?: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// Sharing & Monetization Types
export interface SharedResource {
  id: number
  resource_type: 'pod_resource' | 'context_entry'
  resource_id: number
  price_satoshis: number
  overlay_topic?: string | null
  access_policy: Record<string, any>
  total_earnings: number
  total_accesses: number
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Micropayment {
  id: number
  shared_resource_id: number
  buyer_user_id: string
  seller_user_id: string
  price_satoshis: number
  bsv_tx_hash: string
  payment_status: 'pending' | 'confirmed' | 'failed'
  access_granted: boolean
  created_at: string
  updated_at: string
}

// Overlay Network Sync Types
export interface OverlaySync {
  id: number
  sync_type: 'did' | 'vc' | 'resource' | 'payment'
  reference_id: number
  overlay_topic: string
  sync_status: 'pending' | 'synced' | 'failed'
  last_attempt: string
  retry_count: number
  error_message?: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// Database Insert Types (without auto-generated fields)
export type InsertPodResource = Omit<PodResource, 'id' | 'created_at' | 'updated_at'>
export type InsertIdentity = Omit<Identity, 'id' | 'created_at' | 'updated_at'>
export type InsertBSVAttestation = Omit<BSVAttestation, 'id' | 'created_at'>
export type InsertContextEntry = Omit<ContextEntry, 'id' | 'created_at' | 'updated_at'>
export type InsertSharedResource = Omit<SharedResource, 'id' | 'created_at' | 'updated_at'>
export type InsertMicropayment = Omit<Micropayment, 'id' | 'created_at' | 'updated_at'>
export type InsertOverlaySync = Omit<OverlaySync, 'id' | 'created_at' | 'updated_at'>

// Database Update Types (partial with required ID)
export type UpdatePodResource = Partial<Omit<PodResource, 'id' | 'user_id' | 'created_at'>> & { id: number }
export type UpdateIdentity = Partial<Omit<Identity, 'id' | 'user_id' | 'created_at'>> & { id: number }
export type UpdateContextEntry = Partial<Omit<ContextEntry, 'id' | 'user_id' | 'created_at'>> & { id: number }
export type UpdateSharedResource = Partial<Omit<SharedResource, 'id' | 'user_id' | 'created_at'>> & { id: number }
export type UpdateMicropayment = Partial<Omit<Micropayment, 'id' | 'created_at'>> & { id: number }
export type UpdateOverlaySync = Partial<Omit<OverlaySync, 'id' | 'user_id' | 'created_at'>> & { id: number }

// Query Result Types
export interface PodResourceWithAttestation extends PodResource {
  bsv_attestation?: BSVAttestation | null
}

export interface ContextEntryWithResource extends ContextEntry {
  pod_resource?: PodResource | null
}

export interface SharedResourceWithDetails extends SharedResource {
  pod_resource?: PodResource | null
  context_entry?: ContextEntry | null
}

// Database Error Types
export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// API Response Types
export interface DatabaseResponse<T> {
  data: T | null
  error: DatabaseError | null
  count?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Search and Filter Types
export interface ResourceFilter {
  resource_type?: string
  status?: string
  user_id?: string
  created_after?: string
  created_before?: string
}

export interface ContextFilter {
  content_type?: string
  tags?: string[]
  user_id?: string
  has_pod_resource?: boolean
}

export interface SharedResourceFilter {
  resource_type?: 'pod_resource' | 'context_entry'
  min_price?: number
  max_price?: number
  is_active?: boolean
  overlay_topic?: string
}