import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entryId = parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: entry, error } = await supabase
      .from('context_entry')
      .select(`
        *,
        pod_resource:pod_resource_id(resource_path),
        shared_resource:shared_resource!shared_resource_resource_id_fkey(*)
      `)
      .eq('id', entryId)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Context entry not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch context entry' }, { status: 500 })
    }

    return NextResponse.json({ entry })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entryId = parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, content_type, tags, pod_resource_id } = body

    // Validate required fields
    if (!title || !content || !content_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, content_type' 
      }, { status: 400 })
    }

    // Validate content type
    const validContentTypes = ['text', 'markdown', 'link', 'snippet']
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json({ 
        error: 'Invalid content_type. Must be one of: ' + validContentTypes.join(', ') 
      }, { status: 400 })
    }

    const supabase = createClient()

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      content_type,
      tags: tags || [],
      pod_resource_id: pod_resource_id || null,
      updated_at: new Date().toISOString()
    }

    const { data: entry, error } = await supabase
      .from('context_entry')
      .update(updateData)
      .eq('id', entryId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Context entry not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update context entry' }, { status: 500 })
    }

    return NextResponse.json({ entry })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entryId = parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 })
    }

    const supabase = createClient()

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: fetchError } = await supabase
      .from('context_entry')
      .select('id')
      .eq('id', entryId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Context entry not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch context entry' }, { status: 500 })
    }

    // Delete related shared resources first (cascade should handle this, but being explicit)
    await supabase
      .from('shared_resource')
      .delete()
      .eq('resource_type', 'context_entry')
      .eq('resource_id', entryId)
      .eq('user_id', session.user.id)

    // Delete the context entry
    const { error: deleteError } = await supabase
      .from('context_entry')
      .delete()
      .eq('id', entryId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete context entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}