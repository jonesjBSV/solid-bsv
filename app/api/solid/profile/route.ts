import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'
import { getConnectedIdentity } from '@/lib/database/queries'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { webId } = await request.json()

    if (!webId) {
      return NextResponse.json(
        { error: 'WebID is required' },
        { status: 400 }
      )
    }

    // Get the user's connected identity from database
    const identityResult = await getConnectedIdentity(session.user.id)
    
    if (!identityResult.data || identityResult.data.connection_status !== 'connected') {
      return NextResponse.json(
        { error: 'No connected pod found' },
        { status: 404 }
      )
    }

    // For now, return a mock profile
    // In a real implementation, this would use the SOLID client to fetch the profile
    const profile = {
      webId,
      name: session.user.name || 'Anonymous',
      email: session.user.email,
      storage: [identityResult.data.solid_pod_url],
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's connected identity
    const identityResult = await getConnectedIdentity(session.user.id)
    
    if (!identityResult.data) {
      return NextResponse.json(
        { connected: false },
        { status: 200 }
      )
    }

    return NextResponse.json({
      connected: identityResult.data.connection_status === 'connected',
      podUrl: identityResult.data.solid_pod_url,
      webId: `${identityResult.data.solid_pod_url}profile/card#me`,
    })
  } catch (error) {
    console.error('Profile status error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile status' },
      { status: 500 }
    )
  }
}