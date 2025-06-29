'use client'

/**
 * Performance Monitoring and Optimization Hooks
 * Comprehensive performance monitoring, optimization, and analytics
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// Performance metrics interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay  
  cls?: number // Cumulative Layout Shift
  
  // Other important metrics
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Custom metrics
  componentMountTime?: number
  renderCount?: number
  memoryUsage?: number
}

interface ComponentPerformance {
  mountTime: number
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
}

// Web Vitals monitoring hook
export function useWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    let lcpObserver: PerformanceObserver | null = null
    let fidObserver: PerformanceObserver | null = null
    let clsObserver: PerformanceObserver | null = null

    try {
      // Largest Contentful Paint
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ 
            ...prev, 
            fid: entry.processingStart - entry.startTime 
          }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        setMetrics(prev => ({ ...prev, cls: clsValue }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // First Contentful Paint
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming
        setMetrics(prev => ({
          ...prev,
          ttfb: nav.responseStart - nav.fetchStart,
          fcp: nav.loadEventEnd - nav.fetchStart
        }))
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }))
      }

    } catch (error) {
      console.warn('Performance monitoring not available:', error)
    }

    return () => {
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
    }
  }, [])

  const getGrade = (metric: keyof PerformanceMetrics, value?: number): 'good' | 'needs-improvement' | 'poor' => {
    if (!value) return 'good'

    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  return { metrics, getGrade }
}

// Component performance monitoring
export function useComponentPerformance(componentName: string) {
  const [performance, setPerformance] = useState<ComponentPerformance>({
    mountTime: 0,
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  })
  
  const mountTimeRef = useRef<number>(0)
  const renderTimesRef = useRef<number[]>([])
  const renderStartRef = useRef<number>(0)

  // Track mount time
  useEffect(() => {
    mountTimeRef.current = typeof window !== 'undefined' ? window.performance.now() : 0
    setPerformance(prev => ({
      ...prev,
      mountTime: mountTimeRef.current
    }))

    return () => {
      const unmountTime = window.performance.now()
      console.log(`${componentName} lifecycle:`, {
        mountTime: mountTimeRef.current,
        totalLifetime: unmountTime - mountTimeRef.current
      })
    }
  }, [componentName])

  // Track renders
  useEffect(() => {
    const renderTime = window.performance.now()
    const renderDuration = renderStartRef.current ? renderTime - renderStartRef.current : 0
    
    if (renderDuration > 0) {
      renderTimesRef.current.push(renderDuration)
      
      const averageRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length
      
      setPerformance(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderDuration,
        averageRenderTime
      }))

      // Warn if render is slow
      if (renderDuration > 16) { // 16ms = 60fps threshold
        console.warn(`Slow render detected in ${componentName}:`, {
          renderTime: renderDuration,
          renderCount: performance.renderCount + 1
        })
      }
    }

    renderStartRef.current = window.performance.now()
  })

  return performance
}

// Bundle size and resource monitoring
export function useResourceMetrics() {
  const [resources, setResources] = useState<{
    totalSize: number
    jsSize: number
    cssSize: number
    imageSize: number
    resourceCount: number
    loadTime: number
  }>({
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    resourceCount: 0,
    loadTime: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const calculateResourceMetrics = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      let totalSize = 0
      let jsSize = 0
      let cssSize = 0
      let imageSize = 0
      
      resources.forEach(resource => {
        const size = resource.transferSize || 0
        totalSize += size

        if (resource.name.includes('.js')) {
          jsSize += size
        } else if (resource.name.includes('.css')) {
          cssSize += size
        } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          imageSize += size
        }
      })

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0

      setResources({
        totalSize: totalSize / 1024, // KB
        jsSize: jsSize / 1024,
        cssSize: cssSize / 1024,
        imageSize: imageSize / 1024,
        resourceCount: resources.length,
        loadTime
      })
    }

    // Calculate on load
    if (document.readyState === 'complete') {
      calculateResourceMetrics()
    } else {
      window.addEventListener('load', calculateResourceMetrics)
    }

    return () => {
      window.removeEventListener('load', calculateResourceMetrics)
    }
  }, [])

  return resources
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    limit: number
    percentage: number
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const used = memory.usedJSHeapSize / 1024 / 1024 // MB
        const total = memory.totalJSHeapSize / 1024 / 1024
        const limit = memory.jsHeapSizeLimit / 1024 / 1024
        const percentage = (used / limit) * 100

        setMemoryInfo({ used, total, limit, percentage })

        // Warn if memory usage is high
        if (percentage > 80) {
          console.warn('High memory usage detected:', {
            used: `${used.toFixed(2)}MB`,
            percentage: `${percentage.toFixed(1)}%`
          })
        }
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Performance optimization helpers
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<boolean>(false)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (!throttleRef.current) {
        callback(...args)
        throttleRef.current = true
        setTimeout(() => {
          throttleRef.current = false
        }, delay)
      }
    }) as T,
    [callback, delay]
  )
}

// Intersection observer for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        setIsVisible(visible)
        
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true)
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [hasBeenVisible, options])

  return { elementRef, isVisible, hasBeenVisible }
}

// Bundle analyzer data (for development)
export function useBundleAnalysis() {
  const [bundleInfo, setBundleInfo] = useState<{
    chunks: Array<{
      name: string
      size: number
      type: 'js' | 'css'
    }>
    totalSize: number
    recommendations: string[]
  } | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Simulate bundle analysis (would integrate with webpack-bundle-analyzer in real app)
    const mockBundleInfo = {
      chunks: [
        { name: 'main', size: 245.6, type: 'js' as const },
        { name: 'vendor', size: 892.3, type: 'js' as const },
        { name: 'runtime', size: 12.1, type: 'js' as const },
        { name: 'styles', size: 45.2, type: 'css' as const }
      ],
      totalSize: 1195.2,
      recommendations: [
        'Consider code splitting for vendor bundle',
        'Optimize images and use modern formats',
        'Remove unused CSS classes',
        'Enable gzip compression'
      ]
    }

    setBundleInfo(mockBundleInfo)
  }, [])

  return bundleInfo
}

// Performance budget monitoring
export function usePerformanceBudget() {
  const { metrics } = useWebVitals()
  const resources = useResourceMetrics()
  const memory = useMemoryMonitoring()

  const budgets = {
    lcp: 2500, // ms
    fid: 100,  // ms
    cls: 0.1,  // score
    totalSize: 1000, // KB
    jsSize: 500,     // KB
    loadTime: 3000,  // ms
    memoryUsage: 50  // MB
  }

  const getBudgetStatus = () => {
    const violations = []

    if (metrics.lcp && metrics.lcp > budgets.lcp) {
      violations.push(`LCP exceeds budget: ${metrics.lcp}ms > ${budgets.lcp}ms`)
    }
    
    if (metrics.fid && metrics.fid > budgets.fid) {
      violations.push(`FID exceeds budget: ${metrics.fid}ms > ${budgets.fid}ms`)
    }
    
    if (metrics.cls && metrics.cls > budgets.cls) {
      violations.push(`CLS exceeds budget: ${metrics.cls} > ${budgets.cls}`)
    }
    
    if (resources.totalSize > budgets.totalSize) {
      violations.push(`Total size exceeds budget: ${resources.totalSize.toFixed(1)}KB > ${budgets.totalSize}KB`)
    }
    
    if (resources.jsSize > budgets.jsSize) {
      violations.push(`JS size exceeds budget: ${resources.jsSize.toFixed(1)}KB > ${budgets.jsSize}KB`)
    }
    
    if (resources.loadTime > budgets.loadTime) {
      violations.push(`Load time exceeds budget: ${resources.loadTime}ms > ${budgets.loadTime}ms`)
    }
    
    if (memory && memory.used > budgets.memoryUsage) {
      violations.push(`Memory usage exceeds budget: ${memory.used.toFixed(1)}MB > ${budgets.memoryUsage}MB`)
    }

    return {
      isWithinBudget: violations.length === 0,
      violations,
      score: Math.max(0, 100 - (violations.length * 10))
    }
  }

  return {
    budgets,
    status: getBudgetStatus(),
    metrics,
    resources,
    memory
  }
}