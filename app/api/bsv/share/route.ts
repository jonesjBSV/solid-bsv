import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getOverlayService } from '@/lib/bsv/overlay-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      resourceId,
      resourceType,
      isShared,
      priceSatoshis,
      accessType,
      overlayTopic,
      accessPolicy,
    } = body

    // Validate input
    if (!resourceId || !resourceType) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceId, resourceType' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    if (isShared) {
      // Create or update shared resource configuration
      const { data: resource, error: resourceError } = await supabase
        .from('pod_resource')
        .select('*')
        .eq('id', resourceId)
        .eq('user_id', session.user.id)
        .single()

      if (resourceError || !resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        )
      }

      // Upsert shared resource configuration
      const { error: shareError } = await supabase
        .from('shared_resource')
        .upsert({
          resource_id: resourceId,
          owner_id: session.user.id,
          price_satoshis: priceSatoshis || 0,
          pricing_model: accessType || 'single',
          overlay_topic: overlayTopic,
          access_policy: accessPolicy || { type: 'micropayment' },
          is_active: true,
          updated_at: new Date().toISOString(),
        })

      if (shareError) {
        throw shareError
      }

      // Update resource status
      const { error: updateError } = await supabase
        .from('pod_resource')
        .update({
          status: accessPolicy?.type === 'public' ? 'public' : 'shared',
          overlay_topic: overlayTopic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resourceId)
        .eq('user_id', session.user.id)

      if (updateError) {
        throw updateError
      }

      // Publish to overlay network if public or shared
      if (overlayTopic) {
        const overlayService = getOverlayService()
        await overlayService.publishResource(overlayTopic, {
          resourceId,
          resourceType,
          contentHash: resource.content_hash || '',
          title: resource.title,
          description: resource.description,
          tags: resource.tags || [],
          author: session.user.id,
          priceSatoshis: accessPolicy?.type === 'micropayment' ? priceSatoshis : undefined,
          accessType: accessPolicy?.type === 'public' ? 'public' : 'payment-required',
          timestamp: Date.now(),
        })
      }
    } else {
      // Remove sharing configuration
      const { error: deleteError } = await supabase
        .from('shared_resource')
        .delete()
        .eq('resource_id', resourceId)
        .eq('owner_id', session.user.id)

      if (deleteError) {
        throw deleteError
      }

      // Update resource status to private
      const { error: updateError } = await supabase
        .from('pod_resource')
        .update({
          status: 'private',
          overlay_topic: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resourceId)
        .eq('user_id', session.user.id)

      if (updateError) {
        throw updateError
      }
    }

    return NextResponse.json({
      success: true,
      message: isShared ? 'Resource sharing configured' : 'Resource made private',
    })
  } catch (error) {
    console.error('Share configuration error:', error)
    return NextResponse.json(
      { 
        error: 'Configuration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get resource ID from query params
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Missing resourceId parameter' },
        { status: 400 }
      )
    }

    // Fetch shared resource configuration
    const supabase = createClient()
    const { data, error } = await supabase
      .from('shared_resource')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('owner_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw error
    }

    return NextResponse.json({
      success: true,
      configuration: data || null,
    })
  } catch (error) {
    console.error('Get share configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}