'use client'

/**
 * Search Bar Component
 * Advanced search interface for content discovery
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  FileText, 
  User, 
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react'

export interface SearchFilters {
  query: string
  tags: string[]
  contentType: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  author?: string
  sortBy: 'relevance' | 'date' | 'title' | 'modified'
  sortOrder: 'asc' | 'desc'
  status: string[]
}

interface SearchBarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  suggestions?: string[]
  recentSearches?: string[]
  isLoading?: boolean
  placeholder?: string
  showAdvanced?: boolean
}

export function SearchBar({
  filters,
  onFiltersChange,
  suggestions = [],
  recentSearches = [],
  isLoading = false,
  placeholder = "Search your second brain...",
  showAdvanced = true
}: SearchBarProps) {
  const [showFilters, setShowFilters] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilter = (filterType: keyof SearchFilters) => {
    if (filterType === 'tags') {
      updateFilters({ tags: [] })
    } else if (filterType === 'contentType') {
      updateFilters({ contentType: [] })
    } else if (filterType === 'status') {
      updateFilters({ status: [] })
    } else if (filterType === 'dateRange') {
      updateFilters({ dateRange: {} })
    } else if (filterType === 'author') {
      updateFilters({ author: undefined })
    }
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] })
    }
  }

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) })
  }

  const toggleContentType = (type: string) => {
    const newTypes = filters.contentType.includes(type)
      ? filters.contentType.filter(t => t !== type)
      : [...filters.contentType, type]
    updateFilters({ contentType: newTypes })
  }

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    updateFilters({ status: newStatuses })
  }

  const activeFilterCount = 
    filters.tags.length + 
    filters.contentType.length + 
    filters.status.length + 
    (filters.author ? 1 : 0) + 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0)

  const contentTypes = [
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'markdown', label: 'Markdown', icon: FileText },
    { value: 'link', label: 'Links', icon: FileText },
    { value: 'snippet', label: 'Snippets', icon: FileText }
  ]

  const statusOptions = [
    { value: 'private', label: 'Private' },
    { value: 'shared', label: 'Shared' },
    { value: 'public', label: 'Public' },
    { value: 'notarized', label: 'Notarized' }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date Created' },
    { value: 'modified', label: 'Last Modified' },
    { value: 'title', label: 'Title' }
  ]

  return (
    <div className="space-y-3">
      {/* Main search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            placeholder={placeholder}
            className="pl-10 pr-16"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            )}
            {showAdvanced && (
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Filter className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <AdvancedFilters
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    contentTypes={contentTypes}
                    statusOptions={statusOptions}
                    sortOptions={sortOptions}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Search suggestions dropdown */}
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-2">
              {suggestions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateFilters({ query: suggestion })
                        setShowSuggestions(false)
                        inputRef.current?.blur()
                      }}
                      className="w-full text-left px-2 py-1 text-sm rounded hover:bg-muted"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div className="space-y-1">
                  {suggestions.length > 0 && <div className="border-t my-2" />}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateFilters({ query: search })
                        setShowSuggestions(false)
                        inputRef.current?.blur()
                      }}
                      className="w-full text-left px-2 py-1 text-sm rounded hover:bg-muted text-muted-foreground"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.contentType.map(type => (
            <Badge key={type} variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {contentTypes.find(ct => ct.value === type)?.label || type}
              <button onClick={() => toggleContentType(type)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.status.map(status => (
            <Badge key={status} variant="outline" className="gap-1">
              {status}
              <button onClick={() => toggleStatus(status)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.author && (
            <Badge variant="outline" className="gap-1">
              <User className="h-3 w-3" />
              {filters.author}
              <button onClick={() => clearFilter('author')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              Date range
              <button onClick={() => clearFilter('dateRange')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFiltersChange({
              query: '',
              tags: [],
              contentType: [],
              dateRange: {},
              author: undefined,
              sortBy: 'relevance',
              sortOrder: 'desc',
              status: []
            })}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

// Advanced filters component
interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  contentTypes: Array<{ value: string; label: string; icon: any }>
  statusOptions: Array<{ value: string; label: string }>
  sortOptions: Array<{ value: string; label: string }>
}

function AdvancedFilters({
  filters,
  onFiltersChange,
  contentTypes,
  statusOptions,
  sortOptions
}: AdvancedFiltersProps) {
  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleContentType = (type: string) => {
    const newTypes = filters.contentType.includes(type)
      ? filters.contentType.filter(t => t !== type)
      : [...filters.contentType, type]
    updateFilters({ contentType: newTypes })
  }

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    updateFilters({ status: newStatuses })
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Content Type
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {contentTypes.map(type => (
            <button
              key={type.value}
              onClick={() => toggleContentType(type.value)}
              className={`p-2 text-sm rounded border text-left flex items-center gap-2 ${
                filters.contentType.includes(type.value)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted border-input'
              }`}
            >
              <type.icon className="h-3 w-3" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => toggleStatus(option.value)}
              className={`p-2 text-sm rounded border text-left ${
                filters.status.includes(option.value)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted border-input'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </h4>
        <Input
          placeholder="Add tag and press Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              const tag = e.currentTarget.value.trim()
              if (!filters.tags.includes(tag)) {
                updateFilters({ tags: [...filters.tags, tag] })
              }
              e.currentTarget.value = ''
            }
          }}
        />
      </div>

      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          Sort
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
            className="p-2 text-sm rounded border border-input bg-background"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => updateFilters({ 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
            })}
            className={`p-2 text-sm rounded border flex items-center justify-center gap-2 ${
              'hover:bg-muted border-input'
            }`}
          >
            {filters.sortOrder === 'asc' ? (
              <>
                <SortAsc className="h-3 w-3" />
                Ascending
              </>
            ) : (
              <>
                <SortDesc className="h-3 w-3" />
                Descending
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}