import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'
import { getConnectedIdentity, getPodResourcesForUser } from '@/lib/database/queries'

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
    
    if (!identityResult.data || identityResult.data.connection_status !== 'connected') {
      return NextResponse.json(
        { error: 'No connected pod found' },
        { status: 404 }
      )
    }

    // Get user's pod resources from database
    const resourcesResult = await getPodResourcesForUser(session.user.id)
    
    if (resourcesResult.data) {
      // For now, return mock sync status
      // In a real implementation, this would compare pod contents with database
      const mockStatus = {
        totalResources: resourcesResult.data.length + 3, // Simulate some resources in pod not in DB
        syncedResources: resourcesResult.data.length,
        failedResources: 0,
        errors: [],
        lastSyncTime: new Date().toISOString(),
      }

      return NextResponse.json({
        status: mockStatus,
        connected: true,
        podUrl: identityResult.data.solid_pod_url,
      })
    }

    return NextResponse.json({
      status: {
        totalResources: 0,
        syncedResources: 0,
        failedResources: 0,
        errors: [],
        lastSyncTime: new Date().toISOString(),
      },
      connected: true,
      podUrl: identityResult.data.solid_pod_url,
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}