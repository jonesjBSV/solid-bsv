import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NotarizationService } from '@/lib/bsv/notarization-service'
import { ProtoWallet } from '@/lib/bsv/proto-wallet'
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
      resourceId,
      resourceType,
      content,
      metadata,
      overlayTopic,
      deliveryMethod = 'direct',
    } = body

    // Validate input
    if (!resourceId || !resourceType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceId, resourceType, content' },
        { status: 400 }
      )
    }

    // Calculate content hash
    const contentHash = await Hash.sha256(
      Buffer.from(typeof content === 'string' ? content : JSON.stringify(content))
    ).toString('hex')

    // Initialize services
    const appWallet = new ProtoWallet({ network: 'mainnet' })
    const notarizationService = new NotarizationService(appWallet)

    // Perform notarization
    const result = await notarizationService.notarizeResource({
      resourceId,
      resourceType,
      contentHash,
      metadata: {
        ...metadata,
        author: session.user.id,
        timestamp: new Date().toISOString(),
      },
      overlayTopic,
      deliveryMethod,
    })

    // Store notarization record in database
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('bsv_attestation')
      .insert({
        resource_id: resourceId,
        tx_hash: result.txid,
        content_hash: contentHash,
        overlay_topic: overlayTopic,
        created_by: session.user.id,
      })

    if (dbError) {
      console.error('Failed to store notarization record:', dbError)
    }

    return NextResponse.json({
      success: true,
      result: {
        txid: result.txid,
        contentHash,
        timestamp: new Date().toISOString(),
        overlayTopic: result.overlayTopic,
      },
    })
  } catch (error) {
    console.error('Notarization API error:', error)
    return NextResponse.json(
      { error: 'Notarization failed', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Fetch notarization records from database
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bsv_attestation')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('created_by', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      attestations: data || [],
    })
  } catch (error) {
    console.error('Get notarization API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notarizations' },
      { status: 500 }
    )
  }
}