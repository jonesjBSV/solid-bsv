'use client'

/**
 * Lazy Loading Components
 * Optimized components with lazy loading and suspense boundaries
 */

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Loading fallback components
export function ComponentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </CardContent>
    </Card>
  )
}

export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
        </div>
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">{text}</span>
      </div>
    </div>
  )
}

// Lazy loaded components with optimized loading
export const LazySearchPageContent = dynamic(
  () => import('@/components/search/SearchPageContent').then(mod => ({ default: mod.SearchPageContent })),
  {
    loading: () => <SearchSkeleton />,
    ssr: false
  }
)

export const LazyUserSettingsContent = dynamic(
  () => import('@/components/app/UserSettingsContent').then(mod => ({ default: mod.UserSettingsContent })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyErrorReporting = dynamic(
  () => import('@/components/error/ErrorReporting').then(mod => ({ default: mod.ErrorReporting })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyPodResourceForm = dynamic(
  () => import('@/components/forms/PodResourceForm').then(mod => ({ default: mod.PodResourceForm })),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

export const LazyContextEntryForm = dynamic(
  () => import('@/components/forms/ContextEntryForm').then(mod => ({ default: mod.ContextEntryForm })),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

export const LazySharedResourceForm = dynamic(
  () => import('@/components/forms/SharedResourceForm').then(mod => ({ default: mod.SharedResourceForm })),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

// HOC for adding suspense boundaries
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <ComponentSkeleton />}>
      <Component {...props} />
    </Suspense>
  )
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for preloading components
export function usePreloadComponents() {
  const preloadSearch = React.useCallback(() => {
    import('@/components/search/SearchPageContent')
  }, [])

  const preloadSettings = React.useCallback(() => {
    import('@/components/app/UserSettingsContent')
  }, [])

  const preloadForms = React.useCallback(() => {
    Promise.all([
      import('@/components/forms/PodResourceForm'),
      import('@/components/forms/ContextEntryForm'),
      import('@/components/forms/SharedResourceForm')
    ])
  }, [])

  const preloadErrorReporting = React.useCallback(() => {
    import('@/components/error/ErrorReporting')
  }, [])

  return {
    preloadSearch,
    preloadSettings,
    preloadForms,
    preloadErrorReporting
  }
}

// Performance monitoring component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime)
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cls = 0
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            cls += entry.value
          }
        })
        console.log('CLS:', cls)
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }, [])

  return <>{children}</>
}

// Resource hints component
export function ResourceHints() {
  React.useEffect(() => {
    // Preload critical resources
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = '/fonts/inter.woff2'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)

    // Prefetch likely navigation targets
    const prefetchTargets = ['/search', '/settings']
    prefetchTargets.forEach(href => {
      const prefetchLink = document.createElement('link')
      prefetchLink.rel = 'prefetch'
      prefetchLink.href = href
      document.head.appendChild(prefetchLink)
    })

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null
}