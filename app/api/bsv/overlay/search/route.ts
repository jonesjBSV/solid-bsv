import { NextRequest, NextResponse } from 'next/server'
import { getOverlayService } from '@/lib/bsv/overlay-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const topic = searchParams.get('topic') || 'tm_context_general'
    const query = searchParams.get('query') || ''
    const resourceType = searchParams.get('resourceType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const author = searchParams.get('author')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build filters
    const filters: any = {}
    if (resourceType) filters.resourceType = resourceType
    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: parseInt(minPrice || '0'),
        max: parseInt(maxPrice || '999999999'),
      }
    }
    if (tags && tags.length > 0) filters.tags = tags
    if (author) filters.author = author

    // Search overlay network
    const overlayService = getOverlayService()
    const results = await overlayService.searchResources({
      topic,
      query,
      filters,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Overlay search error:', error)
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body for complex search
    const body = await request.json()
    const {
      topics = ['tm_context_general'],
      query,
      filters,
      sortBy,
      limit = 50,
      offset = 0,
    } = body

    const overlayService = getOverlayService()
    
    // Search multiple topics
    const allResults = await Promise.all(
      topics.map((topic: string) =>
        overlayService.searchResources({
          topic,
          query,
          filters,
          limit,
          offset,
        })
      )
    )

    // Combine and deduplicate results
    const combinedResources = allResults
      .flatMap(r => r.resources)
      .filter((resource, index, self) =>
        index === self.findIndex(r => r.resourceId === resource.resourceId)
      )

    // Apply sorting
    let sortedResources = [...combinedResources]
    switch (sortBy) {
      case 'popular':
        // In real app, would sort by access count
        break
      case 'price-low':
        sortedResources.sort((a, b) => (a.priceSatoshis || 0) - (b.priceSatoshis || 0))
        break
      case 'price-high':
        sortedResources.sort((a, b) => (b.priceSatoshis || 0) - (a.priceSatoshis || 0))
        break
      case 'newest':
      default:
        sortedResources.sort((a, b) => b.timestamp - a.timestamp)
        break
    }

    return NextResponse.json({
      success: true,
      resources: sortedResources.slice(offset, offset + limit),
      total: sortedResources.length,
      hasMore: sortedResources.length > offset + limit,
    })
  } catch (error) {
    console.error('Overlay search error:', error)
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}