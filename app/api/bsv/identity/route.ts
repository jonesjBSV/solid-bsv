import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { IdentityService } from '@/lib/bsv/identity-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { action } = body

    const identityService = new IdentityService({
      method: 'bsv',
      network: 'mainnet',
    })

    switch (action) {
      case 'create_did': {
        const { publicKey, solidWebId, services } = body
        
        if (!publicKey) {
          return NextResponse.json(
            { error: 'Public key required' },
            { status: 400 }
          )
        }

        // Create DID document
        const didDocument = await identityService.createDID({
          publicKey,
          solidWebId,
          services,
        })

        // Timestamp on BSV
        const timestampedDID = await identityService.timestampDID(didDocument)

        // Store in database
        const supabase = createClient()
        const { error: dbError } = await supabase
          .from('identity')
          .insert({
            user_id: session.user.id,
            did: timestampedDID.id,
            did_method: 'bsv',
            solid_webid: solidWebId,
            public_key: publicKey,
            attestation_tx_hash: timestampedDID.bsvTimestamp?.txHash,
            metadata: {
              services: services || [],
              created_at: new Date().toISOString(),
            },
          })

        if (dbError) {
          throw dbError
        }

        return NextResponse.json({
          success: true,
          didDocument: timestampedDID,
        })
      }

      case 'link_webid': {
        const { solidWebId, bsvDID, publicKey } = body

        if (!solidWebId || !bsvDID || !publicKey) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const result = await identityService.linkWebIDToDID({
          solidWebId,
          bsvDID,
          publicKey,
        })

        if (result.success) {
          // Update database
          const supabase = createClient()
          await supabase
            .from('identity')
            .update({
              solid_webid: solidWebId,
              updated_at: new Date().toISOString(),
            })
            .eq('did', bsvDID)
            .eq('user_id', session.user.id)
        }

        return NextResponse.json(result)
      }

      case 'create_credential': {
        const { subject, type, issuerDID } = body

        if (!subject || !type || !issuerDID) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const credential = await identityService.createCredential({
          subject,
          type,
          issuerDID,
        })

        // Timestamp the credential
        const { txHash } = await identityService.timestampCredential(credential)

        return NextResponse.json({
          success: true,
          credential,
          txHash,
        })
      }

      case 'verify_credential': {
        const { credential, expectedIssuer } = body

        if (!credential) {
          return NextResponse.json(
            { error: 'Credential required' },
            { status: 400 }
          )
        }

        const verification = await identityService.verifyCredential(
          credential,
          expectedIssuer
        )

        return NextResponse.json({
          success: true,
          ...verification,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Identity API error:', error)
    return NextResponse.json(
      { 
        error: 'Operation failed', 
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
    const did = searchParams.get('did')

    const supabase = createClient()

    if (did) {
      // Get specific DID
      const { data, error } = await supabase
        .from('identity')
        .select('*')
        .eq('did', did)
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        identity: data,
      })
    } else {
      // Get all DIDs for user
      const { data, error } = await supabase
        .from('identity')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        identities: data || [],
      })
    }
  } catch (error) {
    console.error('Get identity API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch identity' },
      { status: 500 }
    )
  }
}