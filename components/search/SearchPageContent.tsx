'use client'

/**
 * Search Page Content Component
 * Main search interface combining all search functionality
 */

import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { SearchBar, SearchFilters } from './SearchBar'
import { SearchResults, SearchStats } from './SearchResults'
import { useSearch, SearchResult } from '@/hooks/useSearch'
import { 
  Search, 
  Save, 
  History, 
  Bookmark, 
  TrendingUp,
  Clock,
  Star,
  Filter,
  Download,
  Share2
} from 'lucide-react'

export function SearchPageContent() {
  const { data: session } = useSession()
  const {
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
  } = useSearch({
    debounceMs: 300,
    maxResults: 20,
    enableRealtime: true
  })

  const [showSaveSearch, setShowSaveSearch] = React.useState(false)
  const [saveSearchName, setSaveSearchName] = React.useState('')
  const [selectedTab, setSelectedTab] = React.useState('all')

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      saveSearch(saveSearchName.trim())
      setSaveSearchName('')
      setShowSaveSearch(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // TODO: Navigate to the result detail page
    console.log('Navigate to result:', result)
  }

  const handleResultAction = (result: SearchResult, action: string) => {
    switch (action) {
      case 'view':
        handleResultClick(result)
        break
      case 'share':
        // TODO: Implement sharing
        console.log('Share result:', result)
        break
      case 'save':
        // TODO: Implement saving to collections
        console.log('Save result:', result)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const hasActiveSearch = filters.query.trim() || 
    filters.tags.length > 0 || 
    filters.contentType.length > 0 || 
    filters.status.length > 0 ||
    filters.author ||
    filters.dateRange.from ||
    filters.dateRange.to

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p>Please sign in to search your content.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-8 w-8" />
          Search
        </h1>
        <p className="text-muted-foreground">
          Find anything in your second brain knowledge base
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <SearchBar
          filters={filters}
          onFiltersChange={setFilters}
          suggestions={suggestions}
          recentSearches={recentSearches}
          isLoading={isLoading}
          placeholder="Search your notes, resources, and shared content..."
          showAdvanced={true}
        />

        {/* Save Search */}
        {hasActiveSearch && !showSaveSearch && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveSearch(true)}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Search
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement search export
                console.log('Export search results')
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        )}

        {/* Save Search Input */}
        {showSaveSearch && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter a name for this search..."
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveSearch()
                    } else if (e.key === 'Escape') {
                      setShowSaveSearch(false)
                      setSaveSearchName('')
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveSearch}>
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowSaveSearch(false)
                    setSaveSearchName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Saved Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedSearches.map((saved, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button
                      onClick={() => setFilters(saved.filters)}
                      className="text-sm text-left hover:text-primary truncate flex-1"
                      title={saved.name}
                    >
                      {saved.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={() => deleteSavedSearch(saved.name)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setFilters({ ...filters, query: search })}
                    className="text-sm text-left hover:text-primary truncate w-full"
                    title={search}
                  >
                    {search}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={filters.status.includes('private') ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const newStatus = filters.status.includes('private')
                    ? filters.status.filter(s => s !== 'private')
                    : [...filters.status, 'private']
                  setFilters({ ...filters, status: newStatus })
                }}
              >
                Private Content
              </Button>
              
              <Button
                variant={filters.status.includes('shared') ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const newStatus = filters.status.includes('shared')
                    ? filters.status.filter(s => s !== 'shared')
                    : [...filters.status, 'shared']
                  setFilters({ ...filters, status: newStatus })
                }}
              >
                Shared Content
              </Button>
              
              <Button
                variant={filters.contentType.includes('markdown') ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const newTypes = filters.contentType.includes('markdown')
                    ? filters.contentType.filter(t => t !== 'markdown')
                    : [...filters.contentType, 'markdown']
                  setFilters({ ...filters, contentType: newTypes })
                }}
              >
                Markdown Notes
              </Button>
              
              <Button
                variant={filters.sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setFilters({ ...filters, sortBy: 'date', sortOrder: 'desc' })
                }}
              >
                <Clock className="mr-2 h-3 w-3" />
                Recent First
              </Button>
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Use quotes for exact phrases: "react hooks"</p>
              <p>• Add tags to filter results</p>
              <p>• Use filters to narrow by content type</p>
              <p>• Sort by relevance, date, or title</p>
              <p>• Save frequent searches for quick access</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Stats */}
          {(hasActiveSearch || totalCount > 0) && (
            <SearchStats
              totalCount={totalCount}
              query={filters.query}
              filters={filters}
            />
          )}

          {/* Results Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">
                All Results
                {totalCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="context">
                Notes
                <Badge variant="secondary" className="ml-2">
                  {results.filter(r => r.type === 'context').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resources">
                Resources
                <Badge variant="secondary" className="ml-2">
                  {results.filter(r => r.type === 'pod_resource').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="shared">
                Shared
                <Badge variant="secondary" className="ml-2">
                  {results.filter(r => r.type === 'shared_resource').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <SearchResults
                results={results}
                isLoading={isLoading}
                error={error}
                totalCount={totalCount}
                hasMore={hasMore}
                query={filters.query}
                onLoadMore={loadMore}
                onResultClick={handleResultClick}
                onResultAction={handleResultAction}
              />
            </TabsContent>

            <TabsContent value="context" className="mt-4">
              <SearchResults
                results={results.filter(r => r.type === 'context')}
                isLoading={isLoading}
                error={error}
                totalCount={results.filter(r => r.type === 'context').length}
                hasMore={hasMore}
                query={filters.query}
                onLoadMore={loadMore}
                onResultClick={handleResultClick}
                onResultAction={handleResultAction}
              />
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <SearchResults
                results={results.filter(r => r.type === 'pod_resource')}
                isLoading={isLoading}
                error={error}
                totalCount={results.filter(r => r.type === 'pod_resource').length}
                hasMore={hasMore}
                query={filters.query}
                onLoadMore={loadMore}
                onResultClick={handleResultClick}
                onResultAction={handleResultAction}
              />
            </TabsContent>

            <TabsContent value="shared" className="mt-4">
              <SearchResults
                results={results.filter(r => r.type === 'shared_resource')}
                isLoading={isLoading}
                error={error}
                totalCount={results.filter(r => r.type === 'shared_resource').length}
                hasMore={hasMore}
                query={filters.query}
                onLoadMore={loadMore}
                onResultClick={handleResultClick}
                onResultAction={handleResultAction}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}