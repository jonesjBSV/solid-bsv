import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth.config'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
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

    // Validate the pod URL format
    let url: URL
    try {
      url = new URL(podUrl)
    } catch {
      return NextResponse.json({
        isValid: false,
        message: 'Invalid URL format',
      })
    }

    // Try to fetch the pod's profile document or .well-known endpoint
    try {
      // First try the profile card
      const profileUrl = `${url.origin}/profile/card`
      const profileResponse = await fetch(profileUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (profileResponse.ok) {
        return NextResponse.json({
          isValid: true,
          message: 'Valid SOLID Pod with profile',
          profileUrl,
        })
      }

      // Try .well-known/solid
      const wellKnownUrl = `${url.origin}/.well-known/solid`
      const wellKnownResponse = await fetch(wellKnownUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })

      if (wellKnownResponse.ok) {
        return NextResponse.json({
          isValid: true,
          message: 'Valid SOLID Pod',
        })
      }

      // If both fail, it might still be a valid pod but requires auth
      if (profileResponse.status === 401 || wellKnownResponse.status === 401) {
        return NextResponse.json({
          isValid: true,
          message: 'Pod requires authentication',
          requiresAuth: true,
        })
      }

      return NextResponse.json({
        isValid: false,
        message: 'Could not verify as a SOLID Pod',
      })
    } catch (error) {
      console.error('Pod validation error:', error)
      return NextResponse.json({
        isValid: false,
        message: 'Failed to connect to pod',
      })
    }
  } catch (error) {
    console.error('Pod validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}