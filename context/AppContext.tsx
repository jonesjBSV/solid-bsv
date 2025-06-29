'use client'

/**
 * Global Application Context for SOLID+BSV Second Brain
 * Manages application-wide state including user data, loading states, and error handling
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  PodResource, 
  ContextEntry, 
  Identity, 
  SharedResource,
  Micropayment 
} from '@/lib/database/types'

// State Interface
export interface AppState {
  // User & Session
  user: {
    id: string | null
    name: string | null
    email: string | null
    image: string | null
  } | null
  isAuthenticated: boolean
  
  // Identity & SOLID Pod
  identity: Identity | null
  solidConnected: boolean
  
  // User Data
  podResources: PodResource[]
  contextEntries: ContextEntry[]
  sharedResources: SharedResource[]
  micropayments: Micropayment[]
  
  // UI State
  loading: {
    global: boolean
    podResources: boolean
    contextEntries: boolean
    identity: boolean
    sharing: boolean
  }
  
  // Error State
  error: {
    message: string | null
    code: string | null
    context: string | null
  } | null
  
  // App Settings
  settings: {
    theme: 'light' | 'dark' | 'system'
    autoSync: boolean
    notifications: boolean
  }
  
  // Statistics
  stats: {
    podResourcesCount: number
    contextEntriesCount: number
    sharedResourcesCount: number
    totalEarnings: number
    totalSales: number
  }
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'SET_IDENTITY'; payload: Identity | null }
  | { type: 'SET_POD_RESOURCES'; payload: PodResource[] }
  | { type: 'ADD_POD_RESOURCE'; payload: PodResource }
  | { type: 'UPDATE_POD_RESOURCE'; payload: { id: number; updates: Partial<PodResource> } }
  | { type: 'REMOVE_POD_RESOURCE'; payload: number }
  | { type: 'SET_CONTEXT_ENTRIES'; payload: ContextEntry[] }
  | { type: 'ADD_CONTEXT_ENTRY'; payload: ContextEntry }
  | { type: 'UPDATE_CONTEXT_ENTRY'; payload: { id: number; updates: Partial<ContextEntry> } }
  | { type: 'REMOVE_CONTEXT_ENTRY'; payload: number }
  | { type: 'SET_SHARED_RESOURCES'; payload: SharedResource[] }
  | { type: 'ADD_SHARED_RESOURCE'; payload: SharedResource }
  | { type: 'SET_MICROPAYMENTS'; payload: Micropayment[] }
  | { type: 'ADD_MICROPAYMENT'; payload: Micropayment }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: AppState['error'] }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'UPDATE_STATS'; payload: Partial<AppState['stats']> }
  | { type: 'RESET_STATE' }

// Initial State
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  identity: null,
  solidConnected: false,
  podResources: [],
  contextEntries: [],
  sharedResources: [],
  micropayments: [],
  loading: {
    global: false,
    podResources: false,
    contextEntries: false,
    identity: false,
    sharing: false
  },
  error: null,
  settings: {
    theme: 'system',
    autoSync: true,
    notifications: true
  },
  stats: {
    podResourcesCount: 0,
    contextEntriesCount: 0,
    sharedResourcesCount: 0,
    totalEarnings: 0,
    totalSales: 0
  }
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  console.log('AppContext reducer:', action.type, 'payload' in action ? action.payload : '(no payload)')
  
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      }
      
    case 'SET_IDENTITY':
      return {
        ...state,
        identity: action.payload,
        solidConnected: action.payload?.connection_status === 'connected'
      }
      
    case 'SET_POD_RESOURCES':
      return {
        ...state,
        podResources: action.payload,
        stats: {
          ...state.stats,
          podResourcesCount: action.payload.length
        }
      }
      
    case 'ADD_POD_RESOURCE':
      const newPodResources = [...state.podResources, action.payload]
      return {
        ...state,
        podResources: newPodResources,
        stats: {
          ...state.stats,
          podResourcesCount: newPodResources.length
        }
      }
      
    case 'UPDATE_POD_RESOURCE':
      const updatedPodResources = state.podResources.map(resource =>
        resource.id === action.payload.id 
          ? { ...resource, ...action.payload.updates }
          : resource
      )
      return {
        ...state,
        podResources: updatedPodResources
      }
      
    case 'REMOVE_POD_RESOURCE':
      const filteredPodResources = state.podResources.filter(resource => resource.id !== action.payload)
      return {
        ...state,
        podResources: filteredPodResources,
        stats: {
          ...state.stats,
          podResourcesCount: filteredPodResources.length
        }
      }
      
    case 'SET_CONTEXT_ENTRIES':
      return {
        ...state,
        contextEntries: action.payload,
        stats: {
          ...state.stats,
          contextEntriesCount: action.payload.length
        }
      }
      
    case 'ADD_CONTEXT_ENTRY':
      const newContextEntries = [...state.contextEntries, action.payload]
      return {
        ...state,
        contextEntries: newContextEntries,
        stats: {
          ...state.stats,
          contextEntriesCount: newContextEntries.length
        }
      }
      
    case 'UPDATE_CONTEXT_ENTRY':
      const updatedContextEntries = state.contextEntries.map(entry =>
        entry.id === action.payload.id 
          ? { ...entry, ...action.payload.updates }
          : entry
      )
      return {
        ...state,
        contextEntries: updatedContextEntries
      }
      
    case 'REMOVE_CONTEXT_ENTRY':
      const filteredContextEntries = state.contextEntries.filter(entry => entry.id !== action.payload)
      return {
        ...state,
        contextEntries: filteredContextEntries,
        stats: {
          ...state.stats,
          contextEntriesCount: filteredContextEntries.length
        }
      }
      
    case 'SET_SHARED_RESOURCES':
      return {
        ...state,
        sharedResources: action.payload,
        stats: {
          ...state.stats,
          sharedResourcesCount: action.payload.length
        }
      }
      
    case 'ADD_SHARED_RESOURCE':
      const newSharedResources = [...state.sharedResources, action.payload]
      return {
        ...state,
        sharedResources: newSharedResources,
        stats: {
          ...state.stats,
          sharedResourcesCount: newSharedResources.length
        }
      }
      
    case 'SET_MICROPAYMENTS':
      const totalEarnings = action.payload
        .filter(payment => payment.payment_status === 'confirmed')
        .reduce((sum, payment) => sum + payment.amount_satoshis, 0)
      
      return {
        ...state,
        micropayments: action.payload,
        stats: {
          ...state.stats,
          totalEarnings,
          totalSales: action.payload.filter(p => p.payment_status === 'confirmed').length
        }
      }
      
    case 'ADD_MICROPAYMENT':
      const updatedMicropayments = [...state.micropayments, action.payload]
      const newTotalEarnings = updatedMicropayments
        .filter(payment => payment.payment_status === 'confirmed')
        .reduce((sum, payment) => sum + payment.amount_satoshis, 0)
      
      return {
        ...state,
        micropayments: updatedMicropayments,
        stats: {
          ...state.stats,
          totalEarnings: newTotalEarnings,
          totalSales: updatedMicropayments.filter(p => p.payment_status === 'confirmed').length
        }
      }
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      }
      
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      }
      
    case 'RESET_STATE':
      return initialState
      
    default:
      return state
  }
}

// Context Interface
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // Helper Functions
  setLoading: (key: keyof AppState['loading'], value: boolean) => void
  setError: (error: AppState['error']) => void
  clearError: () => void
  updateStats: (stats: Partial<AppState['stats']>) => void
  
  // Data Management
  addPodResource: (resource: PodResource) => void
  updatePodResource: (id: number, updates: Partial<PodResource>) => void
  removePodResource: (id: number) => void
  
  addContextEntry: (entry: ContextEntry) => void
  updateContextEntry: (id: number, updates: Partial<ContextEntry>) => void
  removeContextEntry: (id: number) => void
  
  addSharedResource: (resource: SharedResource) => void
  addMicropayment: (payment: Micropayment) => void
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider Component
interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { data: session, status } = useSession()
  
  // Sync session with app state
  useEffect(() => {
    console.log('Session status changed:', status)
    console.log('Session data:', session)
    
    if (status === 'authenticated' && session?.user) {
      dispatch({
        type: 'SET_USER',
        payload: {
          id: session.user.email || null, // Using email as ID for now
          name: session.user.name || null,
          email: session.user.email || null,
          image: session.user.image || null
        }
      })
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'RESET_STATE' })
    }
  }, [session, status])
  
  // Helper Functions
  const setLoading = useCallback((key: keyof AppState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } })
  }, [])
  
  const setError = useCallback((error: AppState['error']) => {
    console.error('App error set:', error)
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])
  
  const updateStats = useCallback((stats: Partial<AppState['stats']>) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats })
  }, [])
  
  // Data Management Functions
  const addPodResource = useCallback((resource: PodResource) => {
    dispatch({ type: 'ADD_POD_RESOURCE', payload: resource })
  }, [])
  
  const updatePodResource = useCallback((id: number, updates: Partial<PodResource>) => {
    dispatch({ type: 'UPDATE_POD_RESOURCE', payload: { id, updates } })
  }, [])
  
  const removePodResource = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_POD_RESOURCE', payload: id })
  }, [])
  
  const addContextEntry = useCallback((entry: ContextEntry) => {
    dispatch({ type: 'ADD_CONTEXT_ENTRY', payload: entry })
  }, [])
  
  const updateContextEntry = useCallback((id: number, updates: Partial<ContextEntry>) => {
    dispatch({ type: 'UPDATE_CONTEXT_ENTRY', payload: { id, updates } })
  }, [])
  
  const removeContextEntry = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_CONTEXT_ENTRY', payload: id })
  }, [])
  
  const addSharedResource = useCallback((resource: SharedResource) => {
    dispatch({ type: 'ADD_SHARED_RESOURCE', payload: resource })
  }, [])
  
  const addMicropayment = useCallback((payment: Micropayment) => {
    dispatch({ type: 'ADD_MICROPAYMENT', payload: payment })
  }, [])
  
  const contextValue: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    clearError,
    updateStats,
    addPodResource,
    updatePodResource,
    removePodResource,
    addContextEntry,
    updateContextEntry,
    removeContextEntry,
    addSharedResource,
    addMicropayment
  }
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Convenience hooks
export function useAppState() {
  const { state } = useAppContext()
  return state
}

export function useLoading() {
  const { state, setLoading } = useAppContext()
  return {
    loading: state.loading,
    setLoading
  }
}

export function useError() {
  const { state, setError, clearError } = useAppContext()
  return {
    error: state.error,
    setError,
    clearError
  }
}

export function useStats() {
  const { state, updateStats } = useAppContext()
  return {
    stats: state.stats,
    updateStats
  }
}