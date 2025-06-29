'use client'

/**
 * Search Hook
 * Manages search state, filtering, and real-time search functionality
 */

import React from 'react'
import { SearchFilters } from '@/components/search/SearchBar'
import { ContextEntry, PodResource, SharedResource } from '@/lib/database/types'

export interface SearchResult {
  id: string
  type: 'context' | 'pod_resource' | 'shared_resource'
  title: string
  content: string
  tags: string[]
  author?: string
  createdAt: Date
  modifiedAt: Date
  status: string
  score: number
  highlights: string[]
}

interface UseSearchOptions {
  debounceMs?: number
  maxResults?: number
  enableRealtime?: boolean
  includeTypes?: Array<'context' | 'pod_resource' | 'shared_resource'>
}

interface UseSearchReturn {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  filters: SearchFilters
  suggestions: string[]
  recentSearches: string[]
  setFilters: (filters: SearchFilters) => void
  loadMore: () => void
  clearSearch: () => void
  saveSearch: (name: string) => void
  deleteSavedSearch: (name: string) => void
  savedSearches: Array<{ name: string; filters: SearchFilters }>
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  tags: [],
  contentType: [],
  dateRange: {},
  author: undefined,
  sortBy: 'relevance',
  sortOrder: 'desc',
  status: []
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    maxResults = 50,
    enableRealtime = true,
    includeTypes = ['context', 'pod_resource', 'shared_resource']
  } = options

  const [filters, setFilters] = React.useState<SearchFilters>(DEFAULT_FILTERS)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [totalCount, setTotalCount] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [savedSearches, setSavedSearches] = React.useState<Array<{ name: string; filters: SearchFilters }>>([])
  
  const [currentPage, setCurrentPage] = React.useState(0)
  const searchAbortController = React.useRef<AbortController | null>(null)

  // Load saved data from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('solid-bsv-recent-searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
      
      const savedSearchesData = localStorage.getItem('solid-bsv-saved-searches')
      if (savedSearchesData) {
        setSavedSearches(JSON.parse(savedSearchesData))
      }
    } catch (error) {
      console.warn('Failed to load search data from localStorage:', error)
    }
  }, [])

  // Save recent searches to localStorage
  const addRecentSearch = React.useCallback((query: string) => {
    if (!query.trim() || query.length < 2) return
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== query)
      const updated = [query, ...filtered].slice(0, 10)
      
      try {
        localStorage.setItem('solid-bsv-recent-searches', JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to save recent searches:', error)
      }
      
      return updated
    })
  }, [])

  // Debounced search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.query.trim() || 
          filters.tags.length > 0 || 
          filters.contentType.length > 0 || 
          filters.status.length > 0 ||
          filters.author ||
          filters.dateRange.from ||
          filters.dateRange.to) {
        performSearch(true)
      } else {
        setResults([])
        setTotalCount(0)
        setHasMore(false)
        setError(null)
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [filters, debounceMs])

  // Generate suggestions based on query
  React.useEffect(() => {
    if (filters.query.length > 1) {
      generateSuggestions(filters.query)
    } else {
      setSuggestions([])
    }
  }, [filters.query])

  const performSearch = async (resetPage = false) => {
    // Cancel previous search
    if (searchAbortController.current) {
      searchAbortController.current.abort()
    }
    
    searchAbortController.current = new AbortController()
    const signal = searchAbortController.current.signal
    
    setIsLoading(true)
    setError(null)
    
    const page = resetPage ? 0 : currentPage
    if (resetPage) {
      setCurrentPage(0)
      setResults([])
    }

    try {
      // Add to recent searches if it's a new query search
      if (resetPage && filters.query.trim()) {
        addRecentSearch(filters.query.trim())
      }

      // TODO: Replace with actual API call
      const searchResults = await mockSearch(filters, page, maxResults, signal)
      
      if (signal.aborted) return
      
      if (resetPage) {
        setResults(searchResults.results)
      } else {
        setResults(prev => [...prev, ...searchResults.results])
      }
      
      setTotalCount(searchResults.totalCount)
      setHasMore(searchResults.hasMore)
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Search failed')
        console.error('Search error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1)
      performSearch(false)
    }
  }

  const clearSearch = () => {
    setFilters(DEFAULT_FILTERS)
    setResults([])
    setTotalCount(0)
    setHasMore(false)
    setError(null)
    setCurrentPage(0)
  }

  const saveSearch = (name: string) => {
    const newSavedSearch = { name, filters }
    setSavedSearches(prev => {
      const filtered = prev.filter(s => s.name !== name)
      const updated = [...filtered, newSavedSearch]
      
      try {
        localStorage.setItem('solid-bsv-saved-searches', JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to save search:', error)
      }
      
      return updated
    })
  }

  const deleteSavedSearch = (name: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(s => s.name !== name)
      
      try {
        localStorage.setItem('solid-bsv-saved-searches', JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to delete saved search:', error)
      }
      
      return updated
    })
  }

  const generateSuggestions = async (query: string) => {
    try {
      // TODO: Replace with actual API call for suggestions
      const mockSuggestions = await mockGetSuggestions(query)
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.warn('Failed to generate suggestions:', error)
      setSuggestions([])
    }
  }

  return {
    results,
    isLoading,
    error,
    totalCount,
    hasMore,
    filters,
    suggestions,
    recentSearches,
    setFilters,
    loadMore,
    clearSearch,
    saveSearch,
    deleteSavedSearch,
    savedSearches
  }
}

// Mock search function - replace with actual API
async function mockSearch(
  filters: SearchFilters, 
  page: number, 
  limit: number,
  signal: AbortSignal
): Promise<{ results: SearchResult[]; totalCount: number; hasMore: boolean }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (signal.aborted) {
    throw new Error('Search aborted')
  }
  
  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'context',
      title: 'React Best Practices',
      content: 'Key principles for writing maintainable React code...',
      tags: ['react', 'javascript', 'frontend'],
      author: 'John Doe',
      createdAt: new Date('2024-01-15'),
      modifiedAt: new Date('2024-01-20'),
      status: 'private',
      score: 0.95,
      highlights: ['React code', 'best practices']
    },
    {
      id: '2',
      type: 'pod_resource',
      title: 'TypeScript Configuration',
      content: 'Complete guide to setting up TypeScript...',
      tags: ['typescript', 'configuration'],
      createdAt: new Date('2024-01-10'),
      modifiedAt: new Date('2024-01-18'),
      status: 'shared',
      score: 0.87,
      highlights: ['TypeScript', 'configuration']
    }
  ]
  
  // Filter results based on search criteria
  let filteredResults = mockResults.filter(result => {
    // Query filter
    if (filters.query) {
      const queryLower = filters.query.toLowerCase()
      const matchesQuery = 
        result.title.toLowerCase().includes(queryLower) ||
        result.content.toLowerCase().includes(queryLower) ||
        result.tags.some(tag => tag.toLowerCase().includes(queryLower))
      
      if (!matchesQuery) return false
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag =>
        result.tags.some(resultTag => 
          resultTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
      if (!hasMatchingTag) return false
    }
    
    // Content type filter
    if (filters.contentType.length > 0) {
      // This would be more complex in real implementation
      if (!filters.contentType.includes('text')) return false
    }
    
    // Status filter
    if (filters.status.length > 0) {
      if (!filters.status.includes(result.status)) return false
    }
    
    // Author filter
    if (filters.author && result.author) {
      if (!result.author.toLowerCase().includes(filters.author.toLowerCase())) {
        return false
      }
    }
    
    return true
  })
  
  // Sort results
  filteredResults.sort((a, b) => {
    switch (filters.sortBy) {
      case 'relevance':
        return filters.sortOrder === 'asc' ? a.score - b.score : b.score - a.score
      case 'date':
        return filters.sortOrder === 'asc' 
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      case 'modified':
        return filters.sortOrder === 'asc'
          ? a.modifiedAt.getTime() - b.modifiedAt.getTime()
          : b.modifiedAt.getTime() - a.modifiedAt.getTime()
      case 'title':
        return filters.sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      default:
        return 0
    }
  })
  
  const start = page * limit
  const paginatedResults = filteredResults.slice(start, start + limit)
  
  return {
    results: paginatedResults,
    totalCount: filteredResults.length,
    hasMore: start + limit < filteredResults.length
  }
}

// Mock suggestions function - replace with actual API
async function mockGetSuggestions(query: string): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const mockSuggestions = [
    'react best practices',
    'react hooks',
    'react performance',
    'typescript configuration',
    'typescript types',
    'javascript patterns',
    'frontend architecture',
    'web development'
  ]
  
  return mockSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
}

// Search utilities
export function highlightText(text: string, query: string): string {
  if (!query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function getSearchResultPreview(content: string, query: string, maxLength = 150): string {
  if (!query) {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content
  }
  
  const queryIndex = content.toLowerCase().indexOf(query.toLowerCase())
  if (queryIndex === -1) {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content
  }
  
  const start = Math.max(0, queryIndex - Math.floor(maxLength / 2))
  const end = Math.min(content.length, start + maxLength)
  
  let preview = content.substring(start, end)
  if (start > 0) preview = '...' + preview
  if (end < content.length) preview = preview + '...'
  
  return preview
}