import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'
import { updateIdentityConnection } from '@/lib/database/queries'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { podUrl, oidcIssuer } = await request.json()

    if (!podUrl) {
      return NextResponse.json(
        { error: 'Pod URL is required' },
        { status: 400 }
      )
    }

    // Update the connection status to pending
    const updateResult = await updateIdentityConnection(session.user.id, {
      solid_pod_url: podUrl,
      connection_status: 'pending',
    })

    if (updateResult.error) {
      return NextResponse.json(
        { error: 'Failed to update connection status' },
        { status: 500 }
      )
    }

    // Determine the OIDC issuer
    const issuer = oidcIssuer || deriveOidcIssuer(podUrl)

    // In a real implementation, this would:
    // 1. Initialize a SOLID session
    // 2. Redirect to the OIDC provider for authentication
    // 3. Handle the callback to complete the connection
    
    // For now, we'll simulate a successful connection
    const finalUpdateResult = await updateIdentityConnection(session.user.id, {
      solid_pod_url: podUrl,
      connection_status: 'connected',
      // In reality, we'd store the encrypted access token here
    })

    if (finalUpdateResult.error) {
      return NextResponse.json(
        { error: 'Failed to complete connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      podUrl,
      webId: `${podUrl}profile/card#me`,
    })
  } catch (error) {
    console.error('Pod connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to pod' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Disconnect the pod
    const updateResult = await updateIdentityConnection(session.user.id, {
      solid_pod_url: '',
      connection_status: 'disconnected',
    })

    if (updateResult.error) {
      return NextResponse.json(
        { error: 'Failed to disconnect pod' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Pod disconnected successfully',
    })
  } catch (error) {
    console.error('Pod disconnection error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect pod' },
      { status: 500 }
    )
  }
}

function deriveOidcIssuer(podUrl: string): string {
  try {
    const url = new URL(podUrl)
    // Common SOLID pod providers
    if (url.hostname.includes('solidcommunity.net')) {
      return 'https://solidcommunity.net'
    }
    if (url.hostname.includes('inrupt.net')) {
      return 'https://inrupt.net'
    }
    if (url.hostname.includes('solidweb.org')) {
      return 'https://solidweb.org'
    }
    // Default to the pod's origin
    return url.origin
  } catch {
    return podUrl
  }
}