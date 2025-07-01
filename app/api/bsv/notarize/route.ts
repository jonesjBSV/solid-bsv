import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { NotarizationService } from '@/lib/bsv/notarization-service'
import { ProtoWallet } from '@/lib/bsv/proto-wallet'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      resourceId,
      resourceType,
      contentHash,
      overlayTopic,
      deliveryMethod = 'direct',
      metadata
    } = body

    // Validate required fields
    if (!resourceId || !resourceType || !contentHash) {
      return NextResponse.json({ 
        error: 'Missing required fields: resourceId, resourceType, contentHash' 
      }, { status: 400 })
    }

    // Validate resource type
    const validResourceTypes = ['pod_resource', 'context_entry']
    if (!validResourceTypes.includes(resourceType)) {
      return NextResponse.json({ 
        error: 'Invalid resourceType. Must be one of: ' + validResourceTypes.join(', ') 
      }, { status: 400 })
    }

    const supabase = createClient()

    // Verify the resource exists and belongs to the user
    let resourceExists = false
    let resourceData: any = null

    if (resourceType === 'context_entry') {
      const { data } = await supabase
        .from('context_entry')
        .select('id, title, content, content_type')
        .eq('id', resourceId)
        .eq('user_id', session.user.id)
        .single()
      resourceExists = !!data
      resourceData = data
    } else if (resourceType === 'pod_resource') {
      const { data } = await supabase
        .from('pod_resource')
        .select('id, resource_path, resource_type')
        .eq('id', resourceId)
        .eq('user_id', session.user.id)
        .single()
      resourceExists = !!data
      resourceData = data
    }

    if (!resourceExists) {
      return NextResponse.json({ 
        error: 'Resource not found or access denied' 
      }, { status: 404 })
    }

    // Check if resource is already notarized
    const { data: existingAttestation } = await supabase
      .from('bsv_attestation')
      .select('id, tx_hash')
      .eq('resource_id', resourceId)
      .eq('attestation_type', 'timestamp')
      .eq('user_id', session.user.id)
      .single()

    if (existingAttestation) {
      return NextResponse.json({ 
        error: 'Resource already notarized',
        existingTxHash: existingAttestation.tx_hash
      }, { status: 409 })
    }

    // Initialize notarization service
    const appWallet = new ProtoWallet({ network: 'mainnet' })
    const notarizationService = new NotarizationService(appWallet)

    // Prepare notarization request
    const notarizationRequest = {
      resourceId,
      resourceType,
      contentHash,
      overlayTopic,
      deliveryMethod,
      metadata: {
        title: resourceData.title || resourceData.resource_path,
        description: metadata?.description,
        author: session.user.email || session.user.id,
        ...metadata
      }
    }

    // Perform notarization
    const result = await notarizationService.notarizeResource(notarizationRequest)

    // Store attestation in database
    const { data: attestation, error: dbError } = await supabase
      .from('bsv_attestation')
      .insert({
        resource_id: parseInt(resourceId),
        identity_id: null, // For future DID integration
        attestation_type: 'timestamp',
        tx_hash: result.txid,
        overlay_topic: overlayTopic || null,
        content_hash: contentHash,
        timestamp_proof: {
          beef: Buffer.from(result.beef).toString('base64'),
          deliveryMethod,
          attestationData: result.attestationData
        },
        user_id: session.user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error storing attestation:', dbError)
      // Don't fail the request since notarization succeeded
    }

    // Update resource with BSV transaction hash
    if (resourceType === 'context_entry') {
      await supabase
        .from('context_entry')
        .update({ 
          bsv_tx_hash: result.txid,
          overlay_topic: overlayTopic || null
        })
        .eq('id', resourceId)
        .eq('user_id', session.user.id)
    } else if (resourceType === 'pod_resource') {
      await supabase
        .from('pod_resource')
        .update({ 
          bsv_tx_hash: result.txid,
          overlay_topic: overlayTopic || null
        })
        .eq('id', resourceId)
        .eq('user_id', session.user.id)
    }

    return NextResponse.json({
      success: true,
      notarization: result,
      attestation: attestation
    }, { status: 201 })

  } catch (error) {
    console.error('Notarization API error:', error)
    return NextResponse.json({ 
      error: 'Notarization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')
    const txHash = searchParams.get('txHash')

    if (!resourceId && !txHash) {
      return NextResponse.json({ 
        error: 'Either resourceId or txHash required' 
      }, { status: 400 })
    }

    const supabase = createClient()

    let query = supabase
      .from('bsv_attestation')
      .select(`
        *,
        pod_resource:resource_id(resource_path, resource_type),
        context_entry:resource_id(title, content_type)
      `)
      .eq('user_id', session.user.id)

    if (resourceId) {
      query = query.eq('resource_id', resourceId)
    } else if (txHash) {
      query = query.eq('tx_hash', txHash)
    }

    const { data: attestations, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch attestations' }, { status: 500 })
    }

    return NextResponse.json({
      attestations: attestations || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}