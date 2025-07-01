import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const resourceType = searchParams.get('resource_type')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let query = supabase
      .from('shared_resource')
      .select(`
        *,
        context_entry:resource_id(title, content_type, content, tags),
        pod_resource:resource_id(resource_path),
        user:user_id(id)
      `)
      .eq('shared_with_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    if (minPrice !== null) {
      query = query.gte('price_satoshis', parseInt(minPrice))
    }

    if (maxPrice !== null) {
      query = query.lte('price_satoshis', parseInt(maxPrice))
    }

    // For search, we'll need to filter client-side since we're joining tables
    const { data: resources, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch marketplace resources' }, { status: 500 })
    }

    let filteredResources = resources || []

    // Apply search filter client-side
    if (search) {
      filteredResources = filteredResources.filter(resource => {
        const title = resource.context_entry?.title || resource.pod_resource?.resource_path || ''
        const content = resource.context_entry?.content || ''
        const tags = resource.context_entry?.tags?.join(' ') || ''
        const description = resource.description || ''
        
        const searchLower = search.toLowerCase()
        return (
          title.toLowerCase().includes(searchLower) ||
          content.toLowerCase().includes(searchLower) ||
          tags.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply category filter client-side
    if (category && category !== 'all') {
      filteredResources = filteredResources.filter(resource => {
        if (category === 'context_entry' || category === 'pod_resource') {
          return resource.resource_type === category
        }
        // Filter by content type for context entries
        return resource.resource_type === 'context_entry' && 
               resource.context_entry?.content_type === category
      })
    }

    return NextResponse.json({
      resources: filteredResources,
      count: filteredResources.length,
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}