import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { ContextEntry, InsertContextEntry } from '@/lib/database/types'

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
    const contentType = searchParams.get('content_type')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')

    let query = supabase
      .from('context_entry')
      .select(`
        *,
        pod_resource:pod_resource_id(resource_path),
        shared_resource:shared_resource!shared_resource_resource_id_fkey(*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }

    const { data: entries, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch context entries' }, { status: 500 })
    }

    return NextResponse.json({
      entries: entries || [],
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

    const insertData: InsertContextEntry = {
      title: title.trim(),
      content: content.trim(),
      content_type,
      tags: tags || [],
      pod_resource_id: pod_resource_id || null,
      user_id: session.user.id
    }

    const { data: entry, error } = await supabase
      .from('context_entry')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create context entry' }, { status: 500 })
    }

    return NextResponse.json({ entry }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}