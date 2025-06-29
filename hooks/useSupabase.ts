'use client'

/**
 * Supabase Data Fetching Hooks
 * Provides reusable hooks for data operations with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'
import {
  getPodResourcesForUser,
  getContextEntriesForUser,
  getSharedResources,
  getMicropaymentsByUser,
  getIdentityForUser,
  getUserStats,
  createPodResource,
  createContextEntry,
  updatePodResource as updatePodResourceDB,
  updateContextEntry as updateContextEntryDB,
  deletePodResource,
  deleteContextEntry
} from '@/lib/database/queries'
import {
  PodResource,
  ContextEntry,
  Identity,
  SharedResource,
  Micropayment,
  InsertPodResource,
  InsertContextEntry,
  UpdatePodResource,
  UpdateContextEntry,
  ResourceFilter,
  ContextFilter,
  SharedResourceFilter
} from '@/lib/database/types'

// Hook for fetching user's pod resources
export function usePodResources(filter?: ResourceFilter) {
  const { state, dispatch, setLoading, setError } = useAppContext()
  const { user, isAuthenticated } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchPodResources = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, skipping pod resources fetch')
      return
    }

    console.log('Fetching pod resources for user:', user.id)
    setLoading('podResources', true)
    setError(null)

    try {
      const response = await getPodResourcesForUser(user.id, filter)
      
      if (response.data) {
        dispatch({ type: 'SET_POD_RESOURCES', payload: response.data })
      } else {
        console.error('Failed to fetch pod resources:', response)
        dispatch({ type: 'SET_POD_RESOURCES', payload: [] })
      }
    } catch (error) {
      console.error('Exception fetching pod resources:', error)
      setError({
        message: 'Failed to load pod resources',
        code: 'FETCH_ERROR',
        context: 'usePodResources'
      })
    } finally {
      setLoading('podResources', false)
    }
  }, [user?.id, isAuthenticated, filter, dispatch, setLoading, setError])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchPodResources()
  }, [fetchPodResources, refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const createResource = useCallback(async (resource: InsertPodResource) => {
    console.log('Creating new pod resource:', resource.resource_path)
    setLoading('podResources', true)
    
    try {
      const response = await createPodResource(resource)
      
      if (response.data) {
        dispatch({ type: 'ADD_POD_RESOURCE', payload: response.data })
        return { success: true, data: response.data }
      } else {
        setError({
          message: response.error?.message || 'Failed to create resource',
          code: response.error?.code || 'CREATE_ERROR',
          context: 'createPodResource'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Exception creating pod resource:', error)
      setError({
        message: 'Failed to create resource',
        code: 'CREATE_EXCEPTION',
        context: 'createPodResource'
      })
      return { success: false, error }
    } finally {
      setLoading('podResources', false)
    }
  }, [dispatch, setLoading, setError])

  const updateResource = useCallback(async (update: UpdatePodResource) => {
    console.log('Updating pod resource:', update.id)
    setLoading('podResources', true)
    
    try {
      const response = await updatePodResourceDB(update)
      
      if (response.data) {
        dispatch({ 
          type: 'UPDATE_POD_RESOURCE', 
          payload: { id: update.id, updates: response.data }
        })
        return { success: true, data: response.data }
      } else {
        setError({
          message: response.error?.message || 'Failed to update resource',
          code: response.error?.code || 'UPDATE_ERROR',
          context: 'updatePodResource'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Exception updating pod resource:', error)
      setError({
        message: 'Failed to update resource',
        code: 'UPDATE_EXCEPTION',
        context: 'updatePodResource'
      })
      return { success: false, error }
    } finally {
      setLoading('podResources', false)
    }
  }, [dispatch, setLoading, setError])

  const deleteResource = useCallback(async (id: number) => {
    console.log('Deleting pod resource:', id)
    setLoading('podResources', true)
    
    try {
      const response = await deletePodResource(id)
      
      if (!response.error) {
        dispatch({ type: 'REMOVE_POD_RESOURCE', payload: id })
        return { success: true }
      } else {
        setError({
          message: response.error?.message || 'Failed to delete resource',
          code: response.error?.code || 'DELETE_ERROR',
          context: 'deletePodResource'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Exception deleting pod resource:', error)
      setError({
        message: 'Failed to delete resource',
        code: 'DELETE_EXCEPTION',
        context: 'deletePodResource'
      })
      return { success: false, error }
    } finally {
      setLoading('podResources', false)
    }
  }, [dispatch, setLoading, setError])

  return {
    podResources: state.podResources,
    loading: state.loading.podResources,
    error: state.error,
    refresh,
    createResource,
    updateResource,
    deleteResource
  }
}

// Hook for fetching user's context entries
export function useContextEntries(filter?: ContextFilter) {
  const { state, dispatch, setLoading, setError } = useAppContext()
  const { user, isAuthenticated } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchContextEntries = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, skipping context entries fetch')
      return
    }

    console.log('Fetching context entries for user:', user.id)
    setLoading('contextEntries', true)
    setError(null)

    try {
      const response = await getContextEntriesForUser(user.id, filter)
      
      if (response.data) {
        dispatch({ type: 'SET_CONTEXT_ENTRIES', payload: response.data })
      } else {
        console.error('Failed to fetch context entries:', response)
        dispatch({ type: 'SET_CONTEXT_ENTRIES', payload: [] })
      }
    } catch (error) {
      console.error('Exception fetching context entries:', error)
      setError({
        message: 'Failed to load context entries',
        code: 'FETCH_ERROR',
        context: 'useContextEntries'
      })
    } finally {
      setLoading('contextEntries', false)
    }
  }, [user?.id, isAuthenticated, filter, dispatch, setLoading, setError])

  useEffect(() => {
    fetchContextEntries()
  }, [fetchContextEntries, refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const createEntry = useCallback(async (entry: InsertContextEntry) => {
    console.log('Creating new context entry:', entry.title)
    setLoading('contextEntries', true)
    
    try {
      const response = await createContextEntry(entry)
      
      if (response.data) {
        dispatch({ type: 'ADD_CONTEXT_ENTRY', payload: response.data })
        return { success: true, data: response.data }
      } else {
        setError({
          message: response.error?.message || 'Failed to create entry',
          code: response.error?.code || 'CREATE_ERROR',
          context: 'createContextEntry'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Exception creating context entry:', error)
      setError({
        message: 'Failed to create entry',
        code: 'CREATE_EXCEPTION',
        context: 'createContextEntry'
      })
      return { success: false, error }
    } finally {
      setLoading('contextEntries', false)
    }
  }, [dispatch, setLoading, setError])

  const updateEntry = useCallback(async (update: UpdateContextEntry) => {
    console.log('Updating context entry:', update.id)
    setLoading('contextEntries', true)
    
    try {
      const response = await updateContextEntryDB(update)
      
      if (response.data) {
        dispatch({ 
          type: 'UPDATE_CONTEXT_ENTRY', 
          payload: { id: update.id, updates: response.data }
        })
        return { success: true, data: response.data }
      } else {
        setError({
          message: response.error?.message || 'Failed to update entry',
          code: response.error?.code || 'UPDATE_ERROR',
          context: 'updateContextEntry'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Exception updating context entry:', error)
      setError({
        message: 'Failed to update entry',
        code: 'UPDATE_EXCEPTION',
        context: 'updateContextEntry'
      })
      return { success: false, error }
    } finally {
      setLoading('contextEntries', false)
    }
  }, [dispatch, setLoading, setError])

  const deleteEntry = useCallback(async (id: number) => {
    console.log('Deleting context entry:', id)
    setLoading('contextEntries', true)
    
    try {
      const response = await deleteContextEntry(id)
      
      if (!response.error) {
        dispatch({ type: 'REMOVE_CONTEXT_ENTRY', payload: id })
        return { success: true }
      } else {
        setError({
          message: response.error?.message || 'Failed to delete entry',
          code: response.error?.code || 'DELETE_ERROR',
          context: 'deleteContextEntry'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Exception deleting context entry:', error)
      setError({
        message: 'Failed to delete entry',
        code: 'DELETE_EXCEPTION',
        context: 'deleteContextEntry'
      })
      return { success: false, error }
    } finally {
      setLoading('contextEntries', false)
    }
  }, [dispatch, setLoading, setError])

  return {
    contextEntries: state.contextEntries,
    loading: state.loading.contextEntries,
    error: state.error,
    refresh,
    createEntry,
    updateEntry,
    deleteEntry
  }
}

// Hook for fetching user's identity and SOLID pod info
export function useIdentity() {
  const { state, dispatch, setLoading, setError } = useAppContext()
  const { user, isAuthenticated } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchIdentity = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, skipping identity fetch')
      return
    }

    console.log('Fetching identity for user:', user.id)
    setLoading('identity', true)
    setError(null)

    try {
      const response = await getIdentityForUser(user.id)
      
      if (response.data) {
        dispatch({ type: 'SET_IDENTITY', payload: response.data })
      } else if (response.error?.message?.includes('No rows')) {
        // No identity found - this is normal for new users
        console.log('No identity found for user - creating new user record')
        dispatch({ type: 'SET_IDENTITY', payload: null })
      } else {
        console.error('Failed to fetch identity:', response.error)
        setError({
          message: response.error?.message || 'Failed to load identity',
          code: response.error?.code || 'FETCH_ERROR',
          context: 'useIdentity'
        })
      }
    } catch (error) {
      console.error('Exception fetching identity:', error)
      setError({
        message: 'Failed to load identity',
        code: 'FETCH_EXCEPTION',
        context: 'useIdentity'
      })
    } finally {
      setLoading('identity', false)
    }
  }, [user?.id, isAuthenticated, dispatch, setLoading, setError])

  useEffect(() => {
    fetchIdentity()
  }, [fetchIdentity, refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return {
    identity: state.identity,
    solidConnected: state.solidConnected,
    loading: state.loading.identity,
    error: state.error,
    refresh
  }
}

// Hook for fetching shared resources (marketplace)
export function useSharedResources(filter?: SharedResourceFilter) {
  const { state, dispatch, setLoading, setError } = useAppContext()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchSharedResources = useCallback(async () => {
    console.log('Fetching shared resources with filter:', filter)
    setLoading('sharing', true)
    setError(null)

    try {
      const response = await getSharedResources(filter)
      
      if (response.data) {
        dispatch({ type: 'SET_SHARED_RESOURCES', payload: response.data })
      } else {
        console.error('Failed to fetch shared resources:', response)
        dispatch({ type: 'SET_SHARED_RESOURCES', payload: [] })
      }
    } catch (error) {
      console.error('Exception fetching shared resources:', error)
      setError({
        message: 'Failed to load shared resources',
        code: 'FETCH_ERROR',
        context: 'useSharedResources'
      })
    } finally {
      setLoading('sharing', false)
    }
  }, [filter, dispatch, setLoading, setError])

  useEffect(() => {
    fetchSharedResources()
  }, [fetchSharedResources, refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return {
    sharedResources: state.sharedResources,
    loading: state.loading.sharing,
    error: state.error,
    refresh
  }
}

// Hook for fetching user statistics
export function useUserStats() {
  const { state, updateStats, setError } = useAppContext()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, skipping stats fetch')
      return
    }

    console.log('Fetching user statistics for:', user.id)
    setLoading(true)
    setError(null)

    try {
      const stats = await getUserStats(user.id)
      updateStats(stats)
    } catch (error) {
      console.error('Exception fetching user stats:', error)
      setError({
        message: 'Failed to load statistics',
        code: 'FETCH_ERROR',
        context: 'useUserStats'
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, isAuthenticated, updateStats, setError])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return {
    stats: state.stats,
    loading,
    error: state.error,
    refresh
  }
}

// Hook for optimistic updates
export function useOptimisticUpdates() {
  const { dispatch } = useAppContext()

  const optimisticUpdatePodResource = useCallback((id: number, updates: Partial<PodResource>) => {
    dispatch({ type: 'UPDATE_POD_RESOURCE', payload: { id, updates } })
  }, [dispatch])

  const optimisticUpdateContextEntry = useCallback((id: number, updates: Partial<ContextEntry>) => {
    dispatch({ type: 'UPDATE_CONTEXT_ENTRY', payload: { id, updates } })
  }, [dispatch])

  return {
    optimisticUpdatePodResource,
    optimisticUpdateContextEntry
  }
}