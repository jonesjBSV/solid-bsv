import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'

// This would be shared with the sync route in a real implementation
// For now, we'll create a simple endpoint that returns mock progress

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mock progress response
    // In a real implementation, this would check the actual sync progress
    // stored in Redis, database, or memory
    const mockProgress = {
      progress: 100,
      completed: true,
      status: {
        totalResources: 15,
        syncedResources: 15,
        failedResources: 0,
        errors: [],
        lastSyncTime: new Date(),
      },
    }

    return NextResponse.json(mockProgress)
  } catch (error) {
    console.error('Sync progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync progress' },
      { status: 500 }
    )
  }
}