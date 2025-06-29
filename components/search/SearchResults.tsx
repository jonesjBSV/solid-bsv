'use client'

/**
 * Search Results Component
 * Displays search results with highlighting and pagination
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchResult, highlightText, getSearchResultPreview } from '@/hooks/useSearch'
import { 
  FileText, 
  Database, 
  Share2, 
  Calendar, 
  User, 
  Eye, 
  ExternalLink,
  MoreHorizontal,
  Loader2,
  Search
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  query: string
  onLoadMore: () => void
  onResultClick?: (result: SearchResult) => void
  onResultAction?: (result: SearchResult, action: string) => void
}

export function SearchResults({
  results,
  isLoading,
  error,
  totalCount,
  hasMore,
  query,
  onLoadMore,
  onResultClick,
  onResultAction
}: SearchResultsProps) {
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <p className="text-red-600 font-medium">Search Error</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isLoading && results.length === 0 && (query || totalCount === 0)) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-muted-foreground">
                {query 
                  ? `Try adjusting your search terms or filters`
                  : `Start searching to find your content`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {totalCount} result{totalCount !== 1 ? 's' : ''} found
            {query && (
              <>
                {' '}for "<span className="font-medium text-foreground">{query}</span>"
              </>
            )}
          </span>
          <span>
            Showing {results.length} of {totalCount}
          </span>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <SearchResultCard
            key={`${result.id}-${index}`}
            result={result}
            query={query}
            onClick={() => onResultClick?.(result)}
            onAction={(action) => onResultAction?.(result, action)}
          />
        ))}
        
        {/* Loading skeletons */}
        {isLoading && (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <SearchResultSkeleton key={index} />
            ))}
          </>
        )}
      </div>

      {/* Load more button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Results
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && results.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading more results...</span>
        </div>
      )}
    </div>
  )
}

// Individual search result card
interface SearchResultCardProps {
  result: SearchResult
  query: string
  onClick?: () => void
  onAction?: (action: string) => void
}

function SearchResultCard({ result, query, onClick, onAction }: SearchResultCardProps) {
  const getResultIcon = () => {
    switch (result.type) {
      case 'context':
        return <FileText className="h-4 w-4" />
      case 'pod_resource':
        return <Database className="h-4 w-4" />
      case 'shared_resource':
        return <Share2 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'private':
        return 'bg-gray-100 text-gray-800'
      case 'shared':
        return 'bg-blue-100 text-blue-800'
      case 'public':
        return 'bg-green-100 text-green-800'
      case 'notarized':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const preview = getSearchResultPreview(result.content, query)
  const highlightedTitle = highlightText(result.title, query)
  const highlightedPreview = highlightText(preview, query)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1" onClick={onClick}>
            <div className="flex items-center gap-2">
              {getResultIcon()}
              <CardTitle 
                className="text-lg leading-tight"
                dangerouslySetInnerHTML={{ __html: highlightedTitle }}
              />
              <Badge 
                variant="secondary" 
                className={`text-xs ${getStatusColor(result.status)}`}
              >
                {result.status}
              </Badge>
            </div>
            
            <CardDescription 
              className="line-clamp-2"
              dangerouslySetInnerHTML={{ __html: highlightedPreview }}
            />
          </div>
          
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onAction?.('view')
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onAction?.('menu')
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {result.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{result.author}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(result.modifiedAt, { addSuffix: true })}
              </span>
            </div>
            
            {result.type && (
              <Badge variant="outline" className="text-xs capitalize">
                {result.type.replace('_', ' ')}
              </Badge>
            )}
          </div>
          
          {result.score && (
            <div className="flex items-center gap-1">
              <span>Relevance: {Math.round(result.score * 100)}%</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {result.tags.slice(0, 5).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs"
              >
                {highlightText(tag, query)}
              </Badge>
            ))}
            {result.tags.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{result.tags.length - 5} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Highlights */}
        {result.highlights && result.highlights.length > 0 && (
          <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
            <div className="font-medium mb-1">Matched content:</div>
            <div className="space-y-1">
              {result.highlights.slice(0, 2).map((highlight, index) => (
                <div 
                  key={index}
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: `"${highlightText(highlight, query)}"` }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton for search results
function SearchResultSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
        
        <div className="flex gap-1 mt-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </CardContent>
    </Card>
  )
}

// Search results stats component
interface SearchStatsProps {
  totalCount: number
  query: string
  searchTime?: number
  filters?: any
}

export function SearchStats({ totalCount, query, searchTime, filters }: SearchStatsProps) {
  const activeFilters = filters ? Object.values(filters).flat().filter(Boolean).length : 0
  
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground py-2">
      <div className="flex items-center gap-4">
        <span>
          {totalCount} result{totalCount !== 1 ? 's' : ''}
          {query && (
            <>
              {' '}for "<span className="font-medium text-foreground">{query}</span>"
            </>
          )}
        </span>
        
        {searchTime && (
          <span>({searchTime}ms)</span>
        )}
        
        {activeFilters > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilters} filter{activeFilters !== 1 ? 's' : ''} active
          </Badge>
        )}
      </div>
    </div>
  )
}