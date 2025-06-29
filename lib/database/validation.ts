/**
 * Data Validation Helpers for SOLID+BSV Second Brain Application
 * Using Zod for runtime validation
 */

import { z } from 'zod'

// Base validation schemas
export const userIdSchema = z.string().uuid('Invalid user ID format')

export const resourceTypeSchema = z.enum(['note', 'document', 'context', 'file'], {
  errorMap: () => ({ message: 'Resource type must be note, document, context, or file' })
})

export const statusSchema = z.enum(['private', 'shared', 'notarized', 'public'], {
  errorMap: () => ({ message: 'Status must be private, shared, notarized, or public' })
})

export const contentTypeSchema = z.enum(['text', 'markdown', 'link', 'snippet'], {
  errorMap: () => ({ message: 'Content type must be text, markdown, link, or snippet' })
})

export const connectionStatusSchema = z.enum(['connected', 'disconnected', 'error'], {
  errorMap: () => ({ message: 'Connection status must be connected, disconnected, or error' })
})

export const attestationTypeSchema = z.enum(['did', 'vc', 'resource'], {
  errorMap: () => ({ message: 'Attestation type must be did, vc, or resource' })
})

export const syncTypeSchema = z.enum(['did', 'vc', 'resource', 'payment'], {
  errorMap: () => ({ message: 'Sync type must be did, vc, resource, or payment' })
})

export const syncStatusSchema = z.enum(['pending', 'synced', 'failed'], {
  errorMap: () => ({ message: 'Sync status must be pending, synced, or failed' })
})

export const paymentStatusSchema = z.enum(['pending', 'confirmed', 'failed'], {
  errorMap: () => ({ message: 'Payment status must be pending, confirmed, or failed' })
})

// Pod Resource Validation
export const podResourceSchema = z.object({
  resource_path: z.string().min(1, 'Resource path is required').max(1000, 'Resource path too long'),
  resource_type: resourceTypeSchema,
  status: statusSchema,
  bsv_tx_hash: z.string().length(64, 'BSV transaction hash must be 64 characters').optional().nullable(),
  content_hash: z.string().min(1, 'Content hash required if provided').optional().nullable(),
  resource_size: z.number().positive('Resource size must be positive').optional().nullable(),
  mime_type: z.string().max(255, 'MIME type too long').optional().nullable(),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  user_id: userIdSchema
})

export const insertPodResourceSchema = podResourceSchema
export const updatePodResourceSchema = podResourceSchema.partial().extend({
  id: z.number().positive('Invalid resource ID')
})

// Identity Validation
export const identitySchema = z.object({
  solid_pod_url: z.string().url('Invalid SOLID pod URL').max(500, 'URL too long'),
  connection_status: connectionStatusSchema,
  did: z.string().min(1, 'DID required if provided').optional().nullable(),
  did_document: z.record(z.any()).optional().nullable(),
  verifiable_credential: z.record(z.any()).optional().nullable(),
  did_bsv_tx_hash: z.string().length(64, 'BSV transaction hash must be 64 characters').optional().nullable(),
  vc_bsv_tx_hash: z.string().length(64, 'BSV transaction hash must be 64 characters').optional().nullable(),
  last_sync: z.string().datetime('Invalid datetime format'),
  access_token_encrypted: z.string().optional().nullable(),
  user_id: userIdSchema
})

export const insertIdentitySchema = identitySchema
export const updateIdentitySchema = identitySchema.partial().extend({
  id: z.number().positive('Invalid identity ID')
})

// Context Entry Validation
export const contextEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long'),
  content_type: contentTypeSchema,
  metadata: z.record(z.any()).optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20, 'Too many tags').optional().nullable(),
  pod_resource_id: z.number().positive('Invalid pod resource ID').optional().nullable(),
  bsv_tx_hash: z.string().length(64, 'BSV transaction hash must be 64 characters').optional().nullable(),
  user_id: userIdSchema
})

export const insertContextEntrySchema = contextEntrySchema
export const updateContextEntrySchema = contextEntrySchema.partial().extend({
  id: z.number().positive('Invalid context entry ID')
})

// BSV Attestation Validation
export const bsvAttestationSchema = z.object({
  attestation_type: attestationTypeSchema,
  bsv_tx_hash: z.string().length(64, 'BSV transaction hash must be 64 characters'),
  content_hash: z.string().min(1, 'Content hash is required'),
  timestamp_proof: z.record(z.any()),
  resource_id: z.number().positive('Invalid resource ID').optional().nullable(),
  identity_id: z.number().positive('Invalid identity ID').optional().nullable(),
  user_id: userIdSchema
})

export const insertBSVAttestationSchema = bsvAttestationSchema

// Shared Resource Validation
export const sharedResourceSchema = z.object({
  resource_type: z.enum(['pod_resource', 'context_entry'], {
    errorMap: () => ({ message: 'Resource type must be pod_resource or context_entry' })
  }),
  resource_id: z.number().positive('Invalid resource ID'),
  price_satoshis: z.number().min(1, 'Price must be at least 1 satoshi').max(21000000 * 100000000, 'Price too high'),
  overlay_topic: z.string().min(1).max(255).optional().nullable(),
  access_policy: z.record(z.any()),
  total_earnings: z.number().min(0, 'Total earnings cannot be negative').default(0),
  total_accesses: z.number().min(0, 'Total accesses cannot be negative').default(0),
  is_active: z.boolean().default(true),
  user_id: userIdSchema
})

export const insertSharedResourceSchema = sharedResourceSchema
export const updateSharedResourceSchema = sharedResourceSchema.partial().extend({
  id: z.number().positive('Invalid shared resource ID')
})

// Micropayment Validation
export const micropaymentSchema = z.object({
  shared_resource_id: z.number().positive('Invalid shared resource ID'),
  buyer_user_id: userIdSchema,
  seller_user_id: userIdSchema,
  price_satoshis: z.number().min(1, 'Price must be at least 1 satoshi'),
  bsv_tx_hash: z.string().length(64, 'BSV transaction hash must be 64 characters'),
  payment_status: paymentStatusSchema,
  access_granted: z.boolean().default(false)
})

export const insertMicropaymentSchema = micropaymentSchema
export const updateMicropaymentSchema = micropaymentSchema.partial().extend({
  id: z.number().positive('Invalid micropayment ID')
})

// Overlay Sync Validation
export const overlaySyncSchema = z.object({
  sync_type: syncTypeSchema,
  reference_id: z.number().positive('Invalid reference ID'),
  overlay_topic: z.string().min(1, 'Overlay topic is required').max(255, 'Overlay topic too long'),
  sync_status: syncStatusSchema,
  last_attempt: z.string().datetime('Invalid datetime format'),
  retry_count: z.number().min(0, 'Retry count cannot be negative').max(10, 'Too many retries'),
  error_message: z.string().max(1000, 'Error message too long').optional().nullable(),
  user_id: userIdSchema
})

export const insertOverlaySyncSchema = overlaySyncSchema
export const updateOverlaySyncSchema = overlaySyncSchema.partial().extend({
  id: z.number().positive('Invalid overlay sync ID')
})

// Filter Validation Schemas
export const resourceFilterSchema = z.object({
  resource_type: z.string().optional(),
  status: statusSchema.optional(),
  user_id: userIdSchema.optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional()
}).optional()

export const contextFilterSchema = z.object({
  content_type: contentTypeSchema.optional(),
  tags: z.array(z.string()).optional(),
  user_id: userIdSchema.optional(),
  has_pod_resource: z.boolean().optional()
}).optional()

export const sharedResourceFilterSchema = z.object({
  resource_type: z.enum(['pod_resource', 'context_entry']).optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  is_active: z.boolean().optional(),
  overlay_topic: z.string().optional()
}).optional()

// Pagination Validation
export const paginationSchema = z.object({
  page: z.number().positive('Page must be positive').default(1),
  limit: z.number().positive('Limit must be positive').max(100, 'Limit too high').default(20)
})

// Search Validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(255, 'Search query too long'),
  limit: z.number().positive().max(50, 'Search limit too high').default(10)
})

// Validation Helper Functions
export function validatePodResource(data: unknown) {
  return insertPodResourceSchema.safeParse(data)
}

export function validateContextEntry(data: unknown) {
  return insertContextEntrySchema.safeParse(data)
}

export function validateSharedResource(data: unknown) {
  return insertSharedResourceSchema.safeParse(data)
}

export function validateMicropayment(data: unknown) {
  return insertMicropaymentSchema.safeParse(data)
}

export function validateBSVAttestation(data: unknown) {
  return insertBSVAttestationSchema.safeParse(data)
}

export function validateOverlaySync(data: unknown) {
  return insertOverlaySyncSchema.safeParse(data)
}

export function validateFilters(data: unknown, type: 'resource' | 'context' | 'shared') {
  switch (type) {
    case 'resource':
      return resourceFilterSchema.safeParse(data)
    case 'context':
      return contextFilterSchema.safeParse(data)
    case 'shared':
      return sharedResourceFilterSchema.safeParse(data)
    default:
      return { success: false, error: { message: 'Invalid filter type' } }
  }
}

export function validatePagination(data: unknown) {
  return paginationSchema.safeParse(data)
}

export function validateSearch(data: unknown) {
  return searchSchema.safeParse(data)
}

// BSV-specific validation
export function validateBSVAddress(address: string): boolean {
  // Basic BSV address validation (simplified)
  const bsvAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  return bsvAddressRegex.test(address)
}

export function validateBSVTxHash(hash: string): boolean {
  // BSV transaction hash validation
  const txHashRegex = /^[a-fA-F0-9]{64}$/
  return txHashRegex.test(hash)
}

// SOLID-specific validation
export function validateSOLIDPodURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'https:' && parsedUrl.pathname.endsWith('/')
  } catch {
    return false
  }
}

export function validateDID(did: string): boolean {
  // Basic DID validation
  const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/
  return didRegex.test(did)
}

// Content validation
export function validateMarkdown(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check for potentially dangerous content
  if (content.includes('<script')) {
    errors.push('Script tags not allowed in markdown')
  }
  
  if (content.includes('javascript:')) {
    errors.push('JavaScript protocols not allowed')
  }
  
  // Check content length
  if (content.length > 50000) {
    errors.push('Content too long (max 50,000 characters)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Export commonly used validation functions
export const validate = {
  podResource: validatePodResource,
  contextEntry: validateContextEntry,
  sharedResource: validateSharedResource,
  micropayment: validateMicropayment,
  bsvAttestation: validateBSVAttestation,
  overlaySync: validateOverlaySync,
  filters: validateFilters,
  pagination: validatePagination,
  search: validateSearch,
  bsvAddress: validateBSVAddress,
  bsvTxHash: validateBSVTxHash,
  solidPodURL: validateSOLIDPodURL,
  did: validateDID,
  markdown: validateMarkdown
}