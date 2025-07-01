import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Hash } from '@bsv/sdk'

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
      title,
      content,
      category,
      tags,
      privacyLevel,
      podResourceId,
      relationships,
      metadata,
    } = body

    // Validate required fields
    if (!content || !category || !privacyLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: content, category, privacyLevel' },
        { status: 400 }
      )
    }

    // Calculate content hash
    const contentHash = await Hash.sha256(
      Buffer.from(content)
    ).toString('hex')

    // Create context entry
    const supabase = createClient()
    const { data, error } = await supabase
      .from('context_entry')
      .insert({
        user_id: session.user.id,
        title,
        content,
        category,
        tags: tags || [],
        privacy_level: privacyLevel,
        content_hash: contentHash,
        pod_resource_id: podResourceId,
        relationships: relationships || {
          linkedContexts: [],
          referencedResources: [],
          aiGeneratedLinks: [],
        },
        metadata: {
          ...metadata,
          createdWith: 'manual',
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      contextEntry: data,
    })
  } catch (error) {
    console.error('Create context entry error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create context entry', 
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const podResourceId = searchParams.get('podResourceId')
    const privacyLevel = searchParams.get('privacyLevel')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()
    let query = supabase
      .from('context_entry')
      .select('*')
      .eq('user_id', session.user.id)

    // Apply filters
    if (id) {
      query = query.eq('id', id)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }
    if (podResourceId) {
      query = query.eq('pod_resource_id', podResourceId)
    }
    if (privacyLevel) {
      query = query.eq('privacy_level', privacyLevel)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      entries: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Get context entries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch context entries' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Context entry ID required' },
        { status: 400 }
      )
    }

    // Update context entry
    const supabase = createClient()
    const { data, error } = await supabase
      .from('context_entry')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      contextEntry: data,
    })
  } catch (error) {
    console.error('Update context entry error:', error)
    return NextResponse.json(
      { error: 'Failed to update context entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Context entry ID required' },
        { status: 400 }
      )
    }

    // Delete context entry
    const supabase = createClient()
    const { error } = await supabase
      .from('context_entry')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Context entry deleted',
    })
  } catch (error) {
    console.error('Delete context entry error:', error)
    return NextResponse.json(
      { error: 'Failed to delete context entry' },
      { status: 500 }
    )
  }
}