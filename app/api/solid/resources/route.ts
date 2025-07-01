import { NextRequest, NextResponse } from 'next/server'
import { getSolidSession } from '@/lib/solid/auth'
import { PodResourceService } from '@/lib/solid/pod-resource-service'

export async function POST(request: NextRequest) {
  try {
    const { containerUrl } = await request.json()
    
    if (!containerUrl) {
      return NextResponse.json(
        { error: 'Container URL is required' },
        { status: 400 }
      )
    }
    
    // Get SOLID session
    const session = await getSolidSession()
    if (!session?.info?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated with SOLID pod' },
        { status: 401 }
      )
    }
    
    // List resources in the container
    const podService = new PodResourceService(session.fetch)
    const resources = await podService.listResources(containerUrl)
    
    return NextResponse.json({ resources })
  } catch (error) {
    console.error('Error listing pod resources:', error)
    return NextResponse.json(
      { error: 'Failed to list resources' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { containerUrl, resource } = await request.json()
    
    if (!containerUrl || !resource) {
      return NextResponse.json(
        { error: 'Container URL and resource data are required' },
        { status: 400 }
      )
    }
    
    // Get SOLID session
    const session = await getSolidSession()
    if (!session?.info?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated with SOLID pod' },
        { status: 401 }
      )
    }
    
    // Create resource
    const podService = new PodResourceService(session.fetch)
    const createdResource = await podService.createResource(containerUrl, resource)
    
    if (!createdResource) {
      return NextResponse.json(
        { error: 'Failed to create resource' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ resource: createdResource })
  } catch (error) {
    console.error('Error creating pod resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { resourceUrl, updates } = await request.json()
    
    if (!resourceUrl || !updates) {
      return NextResponse.json(
        { error: 'Resource URL and updates are required' },
        { status: 400 }
      )
    }
    
    // Get SOLID session
    const session = await getSolidSession()
    if (!session?.info?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated with SOLID pod' },
        { status: 401 }
      )
    }
    
    // Update resource
    const podService = new PodResourceService(session.fetch)
    const updatedResource = await podService.updateResource(resourceUrl, updates)
    
    if (!updatedResource) {
      return NextResponse.json(
        { error: 'Failed to update resource' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ resource: updatedResource })
  } catch (error) {
    console.error('Error updating pod resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { resourceUrl } = await request.json()
    
    if (!resourceUrl) {
      return NextResponse.json(
        { error: 'Resource URL is required' },
        { status: 400 }
      )
    }
    
    // Get SOLID session
    const session = await getSolidSession()
    if (!session?.info?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated with SOLID pod' },
        { status: 401 }
      )
    }
    
    // Delete resource
    const podService = new PodResourceService(session.fetch)
    const success = await podService.deleteResource(resourceUrl)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete resource' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pod resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}