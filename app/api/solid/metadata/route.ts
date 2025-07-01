import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'
import { getConnectedIdentity, createPodResource, updatePodResource, getPodResourcesForUser } from '@/lib/database/queries'

// GET metadata for a resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { resourceUrl } = await request.json()

    if (!resourceUrl) {
      return NextResponse.json(
        { error: 'Resource URL is required' },
        { status: 400 }
      )
    }

    // Get the user's connected identity
    const identityResult = await getConnectedIdentity(session.user.id)
    
    if (!identityResult.data || identityResult.data.connection_status !== 'connected') {
      return NextResponse.json(
        { error: 'No connected pod found' },
        { status: 404 }
      )
    }

    // For now, return mock metadata
    // In a real implementation, this would fetch metadata from the pod or database
    const mockMetadata = {
      title: resourceUrl.split('/').pop() || 'Untitled',
      description: 'Mock description for this resource',
      tags: ['document', 'important'],
      category: 'document',
      license: 'cc-by',
      language: 'en',
      created: new Date().toISOString(),
      contentHash: 'sha256:' + Math.random().toString(36).substring(7),
    }

    return NextResponse.json(mockMetadata)
  } catch (error) {
    console.error('Metadata fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}

// PUT (update) metadata for a resource
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { resourceUrl, metadata } = await request.json()

    if (!resourceUrl || !metadata) {
      return NextResponse.json(
        { error: 'Resource URL and metadata are required' },
        { status: 400 }
      )
    }

    // Get the user's connected identity
    const identityResult = await getConnectedIdentity(session.user.id)
    
    if (!identityResult.data || identityResult.data.connection_status !== 'connected') {
      return NextResponse.json(
        { error: 'No connected pod found' },
        { status: 404 }
      )
    }

    // For now, simulate saving metadata
    // In a real implementation, this would:
    // 1. Save metadata to the pod resource in database
    // 2. Potentially update metadata in the SOLID pod itself
    // 3. Create/update RDF metadata documents
    
    console.log(`Mock metadata save for ${resourceUrl}:`, metadata)
    
    return NextResponse.json({
      success: true,
      message: 'Metadata saved successfully',
      metadata,
    })
  } catch (error) {
    console.error('Metadata save error:', error)
    return NextResponse.json(
      { error: 'Failed to save metadata' },
      { status: 500 }
    )
  }
}