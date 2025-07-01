import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { InsertSharedResource } from '@/lib/database/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const resourceType = searchParams.get('resource_type')
    const isActive = searchParams.get('is_active')
    const publicOnly = searchParams.get('public_only') === 'true'

    let query = supabase
      .from('shared_resource')
      .select(`
        *,
        context_entry:resource_id(title, content_type),
        pod_resource:resource_id(resource_path)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by user's own resources unless looking for public ones
    if (!publicOnly) {
      query = query.eq('user_id', session.user.id)
    } else {
      query = query.eq('shared_with_public', true)
    }

    // Apply filters
    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: resources, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch shared resources' }, { status: 500 })
    }

    return NextResponse.json({
      resources: resources || [],
      count,
      limit,
      offset
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      resource_type,
      resource_id,
      shared_with_user_id,
      shared_with_public,
      requires_payment,
      price_per_access,
      price_currency,
      price_satoshis,
      access_limit,
      expiry_date,
      description,
      overlay_topic,
      access_policy
    } = body

    // Validate required fields
    if (!resource_type || !resource_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: resource_type, resource_id' 
      }, { status: 400 })
    }

    // Validate resource type
    const validResourceTypes = ['context_entry', 'pod_resource']
    if (!validResourceTypes.includes(resource_type)) {
      return NextResponse.json({ 
        error: 'Invalid resource_type. Must be one of: ' + validResourceTypes.join(', ') 
      }, { status: 400 })
    }

    const supabase = createClient()

    // Verify the resource exists and belongs to the user
    let resourceExists = false
    if (resource_type === 'context_entry') {
      const { data } = await supabase
        .from('context_entry')
        .select('id')
        .eq('id', resource_id)
        .eq('user_id', session.user.id)
        .single()
      resourceExists = !!data
    } else if (resource_type === 'pod_resource') {
      const { data } = await supabase
        .from('pod_resource')
        .select('id')
        .eq('id', resource_id)
        .eq('user_id', session.user.id)
        .single()
      resourceExists = !!data
    }

    if (!resourceExists) {
      return NextResponse.json({ 
        error: 'Resource not found or access denied' 
      }, { status: 404 })
    }

    // Convert price to satoshis if needed
    let finalPriceSatoshis = price_satoshis
    if (requires_payment && price_per_access && price_currency) {
      if (price_currency === 'USD') {
        // Convert USD to satoshis (assuming 1 BSV = $50, adjust as needed)
        const bsvPrice = price_per_access / 50
        finalPriceSatoshis = Math.round(bsvPrice * 100000000)
      } else if (price_currency === 'BSV') {
        finalPriceSatoshis = Math.round(price_per_access * 100000000)
      } else if (price_currency === 'SAT') {
        finalPriceSatoshis = Math.round(price_per_access)
      }
    }

    const insertData: InsertSharedResource = {
      resource_type,
      resource_id,
      shared_with_user_id: shared_with_user_id || null,
      shared_with_public: shared_with_public || false,
      requires_payment: requires_payment || false,
      price_per_access: price_per_access || null,
      price_currency: price_currency || null,
      price_satoshis: finalPriceSatoshis || null,
      access_limit: access_limit || null,
      expiry_date: expiry_date || null,
      description: description || null,
      overlay_topic: overlay_topic || null,
      access_policy: access_policy || null,
      total_access_count: 0,
      total_earnings_satoshis: 0,
      is_active: true,
      user_id: session.user.id
    }

    const { data: sharedResource, error } = await supabase
      .from('shared_resource')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create shared resource' }, { status: 500 })
    }

    return NextResponse.json({ sharedResource }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}