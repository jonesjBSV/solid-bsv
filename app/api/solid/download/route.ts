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

    // For now, return mock file content
    // In a real implementation, this would use the SolidPodService to download the file
    const mockContent = `# Mock File Content

This is mock content for the file: ${resourceUrl}

In a real implementation, this would be fetched from your SOLID Pod.`
    
    const blob = new Blob([mockContent], { type: 'text/plain' })
    const arrayBuffer = await blob.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${resourceUrl.split('/').pop()}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download resource' },
      { status: 500 }
    )
  }
}