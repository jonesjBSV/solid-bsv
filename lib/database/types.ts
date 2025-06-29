/**
 * Database Types for SOLID+BSV Second Brain Application
 * Generated from Supabase schema definitions
 */

import { Json } from '@/types/database.types'

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
  resource_type: string
  status: string
  bsv_tx_hash?: string | null
  overlay_topic?: string | null
  pod_url: string
  content_hash?: string | null
  description?: string | null
  mime_type?: string | null
  resource_size?: number | null
  user_id: string
  created_at: string
  updated_at: string
}

// Identity & Credentials Types
export interface Identity {
  id: number
  solid_pod_url: string
  did: string
  did_document?: Json | null
  did_bsv_hash?: string | null
  did_overlay_topic?: string | null
  vc?: Json | null
  vc_bsv_hash?: string | null
  vc_overlay_topic?: string | null
  connection_status?: string | null
  access_token?: string | null
  created_at: string
  updated_at: string
  user_id: string
}

// BSV Attestation Types
export interface BSVAttestation {
  id: number
  resource_id?: number | null
  identity_id?: number | null
  attestation_type: string
  tx_hash: string
  overlay_topic?: string | null
  content_hash: string
  timestamp_proof?: Json | null
  wallet_address?: string | null
  created_at: string
  user_id: string
}

// Context Entry Types (Second Brain)
export interface ContextEntry {
  id: number
  title: string
  content: string
  content_type: string
  tags?: string[] | null
  metadata?: Json | null
  pod_resource_id?: number | null
  bsv_tx_hash?: string | null
  overlay_topic?: string | null
  created_at: string
  updated_at: string
  user_id: string
}

// Sharing & Monetization Types
export interface SharedResource {
  id: number
  resource_type: string
  resource_id: number
  
  // General sharing fields
  shared_with_user_id?: string | null
  shared_with_public?: boolean | null
  requires_payment?: boolean | null
  description?: string | null
  access_limit?: number | null
  expiry_date?: string | null
  
  // Payment fields
  price_per_access?: number | null
  price_currency?: string | null
  price_satoshis?: number | null
  
  // BSV/Overlay specific fields
  overlay_topic?: string | null
  access_policy?: Json | null
  payment_address?: string | null
  
  // Stats
  total_access_count?: number | null
  total_earnings_satoshis?: number | null
  is_active?: boolean | null
  created_at: string
  user_id: string
}

export interface Micropayment {
  id: number
  shared_resource_id: number
  buyer_user_id: string
  seller_user_id: string
  amount_satoshis: number
  tx_hash: string
  payment_status: string
  access_granted?: boolean | null
  access_expires_at?: string | null
  created_at: string
  confirmed_at?: string | null
}

// Overlay Network Sync Types
export interface OverlaySync {
  id: number
  sync_type: string
  reference_id: number
  overlay_topic: string
  tx_hash?: string | null
  sync_status: string
  sync_data?: Json | null
  last_sync_at?: string | null
  retry_count?: number | null
  created_at: string
  user_id: string
}

// Database Insert Types (without auto-generated fields)
export type InsertPodResource = Omit<PodResource, 'id' | 'created_at' | 'updated_at'>
export type InsertIdentity = Omit<Identity, 'id' | 'created_at' | 'updated_at'>
export type InsertBSVAttestation = Omit<BSVAttestation, 'id' | 'created_at'>
export type InsertContextEntry = Omit<ContextEntry, 'id' | 'created_at' | 'updated_at'>
export type InsertSharedResource = Omit<SharedResource, 'id' | 'created_at'>
export type InsertMicropayment = Omit<Micropayment, 'id' | 'created_at' | 'confirmed_at'> & { amount_satoshis: number; tx_hash: string }
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

export type SharedResourceWithDetails = SharedResource

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