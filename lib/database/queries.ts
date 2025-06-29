/**
 * Database Query Functions for SOLID+BSV Second Brain Application
 * Centralized database operations with proper error handling
 */

import { createClient } from '@/utils/supabase/server'
import { createClient as createClientClient } from '@/utils/supabase/client'
import {
  PodResource,
  InsertPodResource,
  UpdatePodResource,
  Identity,
  InsertIdentity,
  UpdateIdentity,
  ContextEntry,
  InsertContextEntry,
  UpdateContextEntry,
  SharedResource,
  InsertSharedResource,
  UpdateSharedResource,
  Micropayment,
  InsertMicropayment,
  BSVAttestation,
  InsertBSVAttestation,
  OverlaySync,
  InsertOverlaySync,
  UpdateOverlaySync,
  DatabaseResponse,
  PaginatedResponse,
  ResourceFilter,
  ContextFilter,
  SharedResourceFilter,
  PodResourceWithAttestation,
  ContextEntryWithResource,
  SharedResourceWithDetails
} from './types'

// Helper function to handle Supabase responses
function handleSupabaseResponse<T>(response: any): DatabaseResponse<T> {
  if (response.error) {
    console.error('Database operation failed:', response.error)
    return {
      data: null,
      error: {
        message: response.error.message || 'Database operation failed',
        code: response.error.code,
        details: response.error.details,
        hint: response.error.hint
      }
    }
  }
  
  return {
    data: response.data,
    error: null,
    count: response.count
  }
}

// Pod Resource Operations
export async function createPodResource(
  resource: InsertPodResource
): Promise<DatabaseResponse<PodResource>> {
  console.log('Creating pod resource:', resource.resource_path)
  
  const supabase = createClient()
  const response = await supabase
    .from('pod_resource')
    .insert(resource)
    .select()
    .single()
  
  return handleSupabaseResponse<PodResource>(response)
}

export async function getPodResource(id: number): Promise<DatabaseResponse<PodResource>> {
  console.log('Fetching pod resource:', id)
  
  const supabase = createClient()
  const response = await supabase
    .from('pod_resource')
    .select('*')
    .eq('id', id)
    .single()
  
  return handleSupabaseResponse<PodResource>(response)
}

export async function getPodResourcesForUser(
  userId: string,
  filter?: ResourceFilter,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<PodResource>> {
  console.log('Fetching pod resources for user:', userId)
  
  const supabase = createClient()
  let query = supabase
    .from('pod_resource')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter) {
    if (filter.resource_type) {
      query = query.eq('resource_type', filter.resource_type)
    }
    if (filter.status) {
      query = query.eq('status', filter.status)
    }
    if (filter.created_after) {
      query = query.gte('created_at', filter.created_after)
    }
    if (filter.created_before) {
      query = query.lte('created_at', filter.created_before)
    }
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const response = await query

  if (response.error) {
    console.error('Failed to fetch pod resources:', response.error)
    return {
      data: [],
      count: 0,
      page,
      limit,
      total_pages: 0
    }
  }

  const totalPages = Math.ceil((response.count || 0) / limit)

  return {
    data: response.data || [],
    count: response.count || 0,
    page,
    limit,
    total_pages: totalPages
  }
}

export async function updatePodResource(
  update: UpdatePodResource
): Promise<DatabaseResponse<PodResource>> {
  console.log('Updating pod resource:', update.id)
  
  const supabase = createClient()
  const { id, ...updateData } = update
  
  const response = await supabase
    .from('pod_resource')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse<PodResource>(response)
}

export async function deletePodResource(id: number): Promise<DatabaseResponse<null>> {
  console.log('Deleting pod resource:', id)
  
  const supabase = createClient()
  const response = await supabase
    .from('pod_resource')
    .delete()
    .eq('id', id)
  
  return handleSupabaseResponse<null>(response)
}

// Identity Operations
export async function createIdentity(
  identity: InsertIdentity
): Promise<DatabaseResponse<Identity>> {
  console.log('Creating identity for user:', identity.user_id)
  
  const supabase = createClient()
  const response = await supabase
    .from('identity')
    .insert(identity)
    .select()
    .single()
  
  return handleSupabaseResponse<Identity>(response)
}

export async function getIdentityForUser(userId: string): Promise<DatabaseResponse<Identity>> {
  console.log('Fetching identity for user:', userId)
  
  const supabase = createClient()
  const response = await supabase
    .from('identity')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return handleSupabaseResponse<Identity>(response)
}

export async function updateIdentity(
  update: UpdateIdentity
): Promise<DatabaseResponse<Identity>> {
  console.log('Updating identity:', update.id)
  
  const supabase = createClient()
  const { id, ...updateData } = update
  
  const response = await supabase
    .from('identity')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse<Identity>(response)
}

// Context Entry Operations
export async function createContextEntry(
  entry: InsertContextEntry
): Promise<DatabaseResponse<ContextEntry>> {
  console.log('Creating context entry:', entry.title)
  
  const supabase = createClient()
  const response = await supabase
    .from('context_entry')
    .insert(entry)
    .select()
    .single()
  
  return handleSupabaseResponse<ContextEntry>(response)
}

export async function getContextEntriesForUser(
  userId: string,
  filter?: ContextFilter,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<ContextEntryWithResource>> {
  console.log('Fetching context entries for user:', userId)
  
  const supabase = createClient()
  let query = supabase
    .from('context_entry')
    .select(`
      *,
      pod_resource:pod_resource_id (*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter) {
    if (filter.content_type) {
      query = query.eq('content_type', filter.content_type)
    }
    if (filter.tags && filter.tags.length > 0) {
      query = query.overlaps('tags', filter.tags)
    }
    if (filter.has_pod_resource !== undefined) {
      if (filter.has_pod_resource) {
        query = query.not('pod_resource_id', 'is', null)
      } else {
        query = query.is('pod_resource_id', null)
      }
    }
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const response = await query

  if (response.error) {
    console.error('Failed to fetch context entries:', response.error)
    return {
      data: [],
      count: 0,
      page,
      limit,
      total_pages: 0
    }
  }

  const totalPages = Math.ceil((response.count || 0) / limit)

  return {
    data: response.data || [],
    count: response.count || 0,
    page,
    limit,
    total_pages: totalPages
  }
}

export async function updateContextEntry(
  update: UpdateContextEntry
): Promise<DatabaseResponse<ContextEntry>> {
  console.log('Updating context entry:', update.id)
  
  const supabase = createClient()
  const { id, ...updateData } = update
  
  const response = await supabase
    .from('context_entry')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse<ContextEntry>(response)
}

export async function deleteContextEntry(id: number): Promise<DatabaseResponse<null>> {
  console.log('Deleting context entry:', id)
  
  const supabase = createClient()
  const response = await supabase
    .from('context_entry')
    .delete()
    .eq('id', id)
  
  return handleSupabaseResponse<null>(response)
}

// Shared Resource Operations
export async function createSharedResource(
  resource: InsertSharedResource
): Promise<DatabaseResponse<SharedResource>> {
  console.log('Creating shared resource:', resource.resource_type, resource.resource_id)
  
  const supabase = createClient()
  const response = await supabase
    .from('shared_resource')
    .insert(resource)
    .select()
    .single()
  
  return handleSupabaseResponse<SharedResource>(response)
}

export async function getSharedResources(
  filter?: SharedResourceFilter,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<SharedResourceWithDetails>> {
  console.log('Fetching shared resources with filters:', filter)
  
  const supabase = createClient()
  let query = supabase
    .from('shared_resource')
    .select(`*`, { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter) {
    if (filter.resource_type) {
      query = query.eq('resource_type', filter.resource_type)
    }
    if (filter.min_price !== undefined) {
      query = query.gte('price_satoshis', filter.min_price)
    }
    if (filter.max_price !== undefined) {
      query = query.lte('price_satoshis', filter.max_price)
    }
    if (filter.overlay_topic) {
      query = query.eq('overlay_topic', filter.overlay_topic)
    }
    if (filter.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const response = await query

  if (response.error) {
    console.error('Failed to fetch shared resources:', response.error)
    return {
      data: [],
      count: 0,
      page,
      limit,
      total_pages: 0
    }
  }

  const totalPages = Math.ceil((response.count || 0) / limit)

  return {
    data: response.data || [],
    count: response.count || 0,
    page,
    limit,
    total_pages: totalPages
  }
}

// BSV Attestation Operations
export async function createBSVAttestation(
  attestation: InsertBSVAttestation
): Promise<DatabaseResponse<BSVAttestation>> {
  console.log('Creating BSV attestation:', attestation.tx_hash)
  
  const supabase = createClient()
  const response = await supabase
    .from('bsv_attestation')
    .insert(attestation)
    .select()
    .single()
  
  return handleSupabaseResponse<BSVAttestation>(response)
}

export async function getBSVAttestationByTxHash(
  txHash: string
): Promise<DatabaseResponse<BSVAttestation>> {
  console.log('Fetching BSV attestation by tx hash:', txHash)
  
  const supabase = createClient()
  const response = await supabase
    .from('bsv_attestation')
    .select('*')
    .eq('bsv_tx_hash', txHash)
    .single()
  
  return handleSupabaseResponse<BSVAttestation>(response)
}

// Micropayment Operations
export async function createMicropayment(
  payment: InsertMicropayment
): Promise<DatabaseResponse<Micropayment>> {
  console.log('Creating micropayment:', payment.tx_hash)
  
  const supabase = createClient()
  const response = await supabase
    .from('micropayment')
    .insert(payment)
    .select()
    .single()
  
  return handleSupabaseResponse<Micropayment>(response)
}

export async function getMicropaymentsByUser(
  userId: string,
  type: 'buyer' | 'seller' = 'buyer'
): Promise<DatabaseResponse<Micropayment[]>> {
  console.log('Fetching micropayments for user:', userId, 'as', type)
  
  const supabase = createClient()
  const field = type === 'buyer' ? 'buyer_user_id' : 'seller_user_id'
  
  const response = await supabase
    .from('micropayment')
    .select('*')
    .eq(field, userId)
    .order('created_at', { ascending: false })
  
  return handleSupabaseResponse<Micropayment[]>(response)
}

// Overlay Sync Operations
export async function createOverlaySync(
  sync: InsertOverlaySync
): Promise<DatabaseResponse<OverlaySync>> {
  console.log('Creating overlay sync:', sync.sync_type, sync.reference_id)
  
  const supabase = createClient()
  const response = await supabase
    .from('overlay_sync')
    .insert(sync)
    .select()
    .single()
  
  return handleSupabaseResponse<OverlaySync>(response)
}

export async function updateOverlaySync(
  update: UpdateOverlaySync
): Promise<DatabaseResponse<OverlaySync>> {
  console.log('Updating overlay sync:', update.id)
  
  const supabase = createClient()
  const { id, ...updateData } = update
  
  const response = await supabase
    .from('overlay_sync')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse<OverlaySync>(response)
}

// Search Operations
export async function searchContextEntries(
  userId: string,
  searchTerm: string,
  limit: number = 10
): Promise<DatabaseResponse<ContextEntry[]>> {
  console.log('Searching context entries for:', searchTerm)
  
  const supabase = createClient()
  const response = await supabase
    .from('context_entry')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return handleSupabaseResponse<ContextEntry[]>(response)
}

// Statistics Operations
export async function getUserStats(userId: string) {
  console.log('Fetching user statistics for:', userId)
  
  const supabase = createClient()
  
  // Get counts for different resources
  const [podResources, contextEntries, sharedResources, micropayments] = await Promise.all([
    supabase.from('pod_resource').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('context_entry').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('shared_resource').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('micropayment').select('amount_satoshis', { count: 'exact' }).eq('seller_user_id', userId).eq('payment_status', 'confirmed')
  ])

  const totalEarnings = micropayments.data?.reduce((sum, payment) => sum + payment.amount_satoshis, 0) || 0

  return {
    podResourcesCount: podResources.count || 0,
    contextEntriesCount: contextEntries.count || 0,
    sharedResourcesCount: sharedResources.count || 0,
    totalEarnings,
    totalSales: micropayments.count || 0
  }
}