import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'
import { getConnectedIdentity } from '@/lib/database/queries'

// Store sync progress in memory (in production, use Redis or database)
const syncProgress = new Map<string, {
  progress: number
  status: any
  completed: boolean
}>()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { podUrl } = await request.json()

    if (!podUrl) {
      return NextResponse.json(
        { error: 'Pod URL is required' },
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

    // Start async sync process
    const userId = session.user.id
    startSyncProcess(userId, podUrl)

    return NextResponse.json({
      success: true,
      message: 'Sync started',
      userId,
    })
  } catch (error) {
    console.error('Sync start error:', error)
    return NextResponse.json(
      { error: 'Failed to start sync' },
      { status: 500 }
    )
  }
}

async function startSyncProcess(userId: string, podUrl: string) {
  // Initialize progress
  syncProgress.set(userId, {
    progress: 0,
    status: {
      totalResources: 0,
      syncedResources: 0,
      failedResources: 0,
      errors: [],
      lastSyncTime: new Date(),
    },
    completed: false,
  })

  try {
    // Simulate sync process with progress updates
    const totalSteps = 100
    const mockResources = 15
    
    for (let i = 0; i <= totalSteps; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate work
      
      const currentProgress = syncProgress.get(userId)
      if (currentProgress) {
        syncProgress.set(userId, {
          ...currentProgress,
          progress: i,
          status: {
            ...currentProgress.status,
            totalResources: mockResources,
            syncedResources: Math.floor((i / 100) * mockResources),
          },
        })
      }
    }

    // Mark as completed
    const finalProgress = syncProgress.get(userId)
    if (finalProgress) {
      syncProgress.set(userId, {
        ...finalProgress,
        progress: 100,
        completed: true,
        status: {
          totalResources: mockResources,
          syncedResources: mockResources,
          failedResources: 0,
          errors: [],
          lastSyncTime: new Date(),
        },
      })
    }

    // Clean up after 1 minute
    setTimeout(() => {
      syncProgress.delete(userId)
    }, 60000)
  } catch (error) {
    console.error('Sync process error:', error)
    const currentProgress = syncProgress.get(userId)
    if (currentProgress) {
      syncProgress.set(userId, {
        ...currentProgress,
        completed: true,
        status: {
          ...currentProgress.status,
          failedResources: 1,
          errors: ['Sync process failed'],
        },
      })
    }
  }
}

// Get sync progress
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const progress = syncProgress.get(session.user.id)
    
    if (!progress) {
      return NextResponse.json({
        progress: 0,
        completed: true,
        status: null,
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Sync progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync progress' },
      { status: 500 }
    )
  }
}