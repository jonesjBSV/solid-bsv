'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getSolidSession, 
  getSolidProfile, 
  loginToSolid, 
  logoutFromSolid,
  handleSolidRedirect,
  type SolidProfile 
} from '@/lib/solid/auth'

interface SolidAuthState {
  profile: SolidProfile | null
  isLoading: boolean
  error: string | null
}

interface SolidAuthActions {
  login: (oidcIssuer: string) => Promise<void>
  logout: () => Promise<void>
  refreshStatus: () => Promise<void>
}

type UseSolidAuthReturn = SolidAuthState & SolidAuthActions & { isAuthenticated: boolean }

export function useSolidAuth(): UseSolidAuthReturn {
  const [state, setState] = useState<SolidAuthState>({
    profile: null,
    isLoading: true,
    error: null,
  })

  const refreshStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Handle redirect if coming from SOLID provider
      await handleSolidRedirect()
      
      // Check for existing session
      const session = await getSolidSession()
      
      if (session?.info?.isLoggedIn && session.info.webId) {
        const userProfile = await getSolidProfile(session.info.webId, session.fetch)
        setState({
          profile: userProfile,
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          profile: null,
          isLoading: false,
          error: null,
        })
      }
    } catch (err) {
      console.error('SOLID auth refresh error:', err)
      setState({
        profile: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Authentication failed',
      })
    }
  }, [])

  const login = async (oidcIssuer: string) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }))
    
    try {
      await loginToSolid(oidcIssuer)
      // The actual profile update will happen after redirect
    } catch (err) {
      console.error('SOLID login error:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      }))
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, error: null }))
    
    try {
      await logoutFromSolid()
      setState({
        profile: null,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      console.error('SOLID logout error:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Logout failed',
      }))
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return {
    ...state,
    login,
    logout,
    refreshStatus,
    isAuthenticated: !!state.profile,
  }
}