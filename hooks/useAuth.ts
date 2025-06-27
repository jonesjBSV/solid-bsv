'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export interface AuthUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isUnauthenticated: boolean
  requireAuth: () => void
}

/**
 * Custom hook for managing authentication state
 * Provides easy access to user data and authentication status
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Debug logging
  console.log('useAuth hook called, status:', status)
  console.log('Session data:', session)

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isUnauthenticated = status === 'unauthenticated'

  const user: AuthUser | null = session?.user ? {
    id: session.user.email || undefined, // Using email as ID for now
    name: session.user.name,
    email: session.user.email,
    image: session.user.image
  } : null

  /**
   * Redirect to sign-in if user is not authenticated
   * Useful for protecting pages/components
   */
  const requireAuth = () => {
    console.log('requireAuth called, current status:', status)
    if (isUnauthenticated) {
      console.log('User not authenticated, redirecting to signin')
      router.push('/auth/signin')
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    requireAuth
  }
}

/**
 * Hook for protecting components/pages that require authentication
 * Automatically redirects unauthenticated users to sign-in
 */
export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('useRequireAuth effect, auth status:', auth.isAuthenticated, auth.isUnauthenticated)
    
    // Only redirect if we're sure the user is unauthenticated (not still loading)
    if (!auth.isLoading && auth.isUnauthenticated) {
      console.log('User not authenticated in useRequireAuth, redirecting')
      router.push('/auth/signin')
    }
  }, [auth.isLoading, auth.isUnauthenticated, router])

  return auth
}

/**
 * Hook for getting user profile data
 * Returns user info with helpful computed properties
 */
export function useUserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth()

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U'

  const displayName = user?.name || user?.email || 'Anonymous User'

  console.log('useUserProfile called, user:', user)
  console.log('User initials:', userInitials, 'Display name:', displayName)

  return {
    user,
    isAuthenticated,
    isLoading,
    userInitials,
    displayName,
    hasProfileImage: !!user?.image
  }
}