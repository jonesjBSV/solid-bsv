'use client'

/**
 * Performance Dashboard (Development Only)
 * Real-time performance monitoring and optimization insights
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  useWebVitals, 
  useResourceMetrics, 
  useMemoryMonitoring, 
  usePerformanceBudget,
  useBundleAnalysis 
} from '@/hooks/usePerformance'
import { 
  Activity, 
  Zap, 
  Database, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Download,
  RefreshCw,
  X
} from 'lucide-react'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function PerformanceDashboard({ isOpen, onClose }: PerformanceDashboardProps) {
  const { metrics, getGrade } = useWebVitals()
  const resources = useResourceMetrics()
  const memory = useMemoryMonitoring()
  const budget = usePerformanceBudget()
  const bundleInfo = useBundleAnalysis()

  if (!isOpen || process.env.NODE_ENV !== 'development') return null

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'good': return 'default'
      case 'needs-improvement': return 'secondary'
      case 'poor': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Dashboard
              </CardTitle>
              <CardDescription>
                Real-time performance monitoring and optimization insights
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="vitals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="bundle">Bundle</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* LCP */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Largest Contentful Paint</p>
                        <p className="text-2xl font-bold">
                          {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : 'N/A'}
                        </p>
                      </div>
                      <Badge variant={getGradeBadgeVariant(getGrade('lcp', metrics.lcp))}>
                        {getGrade('lcp', metrics.lcp)}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className={`h-2 rounded-full ${getGradeColor(getGrade('lcp', metrics.lcp))}`} 
                           style={{ width: `${Math.min(100, (metrics.lcp || 0) / 40)}%` }} />
                    </div>
                  </CardContent>
                </Card>

                {/* FID */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">First Input Delay</p>
                        <p className="text-2xl font-bold">
                          {metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A'}
                        </p>
                      </div>
                      <Badge variant={getGradeBadgeVariant(getGrade('fid', metrics.fid))}>
                        {getGrade('fid', metrics.fid)}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className={`h-2 rounded-full ${getGradeColor(getGrade('fid', metrics.fid))}`} 
                           style={{ width: `${Math.min(100, (metrics.fid || 0) / 3)}%` }} />
                    </div>
                  </CardContent>
                </Card>

                {/* CLS */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Cumulative Layout Shift</p>
                        <p className="text-2xl font-bold">
                          {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                        </p>
                      </div>
                      <Badge variant={getGradeBadgeVariant(getGrade('cls', metrics.cls))}>
                        {getGrade('cls', metrics.cls)}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className={`h-2 rounded-full ${getGradeColor(getGrade('cls', metrics.cls))}`} 
                           style={{ width: `${Math.min(100, (metrics.cls || 0) * 400)}%` }} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FCP & TTFB */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Other Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">First Contentful Paint</span>
                      <span className="font-medium">
                        {metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)}s` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time to First Byte</span>
                      <span className="font-medium">
                        {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="font-medium">
                        {metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(1)}MB` : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Performance Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {budget.status.score}
                      </div>
                      <Progress value={budget.status.score} className="mb-4" />
                      <div className="flex items-center justify-center gap-2">
                        {budget.status.isWithinBudget ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Within Budget</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">Budget Exceeded</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Size</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {resources.totalSize.toFixed(1)}KB
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">JavaScript</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {resources.jsSize.toFixed(1)}KB
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-purple-500 rounded" />
                      <span className="text-sm font-medium">CSS</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {resources.cssSize.toFixed(1)}KB
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-green-500 rounded" />
                      <span className="text-sm font-medium">Images</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {resources.imageSize.toFixed(1)}KB
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resource Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total Resources</span>
                      <span className="font-medium">{resources.resourceCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Load Time</span>
                      <span className="font-medium">
                        {(resources.loadTime / 1000).toFixed(2)}s
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="flex h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${(resources.jsSize / resources.totalSize) * 100}%` }}
                        />
                        <div 
                          className="bg-purple-500" 
                          style={{ width: `${(resources.cssSize / resources.totalSize) * 100}%` }}
                        />
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(resources.imageSize / resources.totalSize) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded" />
                        JS ({((resources.jsSize / resources.totalSize) * 100).toFixed(1)}%)
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded" />
                        CSS ({((resources.cssSize / resources.totalSize) * 100).toFixed(1)}%)
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded" />
                        Images ({((resources.imageSize / resources.totalSize) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              {memory ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Used Memory</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        {memory.used.toFixed(1)}MB
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Total Allocated</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        {memory.total.toFixed(1)}MB
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Memory Limit</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        {memory.limit.toFixed(1)}MB
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-lg">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usage: {memory.percentage.toFixed(1)}%</span>
                          <span>{memory.used.toFixed(1)}MB / {memory.limit.toFixed(1)}MB</span>
                        </div>
                        <Progress 
                          value={memory.percentage} 
                          className={memory.percentage > 80 ? 'bg-red-100' : 'bg-green-100'}
                        />
                        {memory.percentage > 80 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>High Memory Usage</AlertTitle>
                            <AlertDescription>
                              Memory usage is above 80%. Consider optimizing component renders and data structures.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Memory Information Unavailable</AlertTitle>
                  <AlertDescription>
                    Memory monitoring is not supported in this browser.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Budget Status</CardTitle>
                  <CardDescription>
                    Current performance metrics vs. defined budgets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {budget.status.violations.length > 0 ? (
                    <div className="space-y-3">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Budget Violations Detected</AlertTitle>
                        <AlertDescription>
                          {budget.status.violations.length} metric(s) exceed performance budget
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        {budget.status.violations.map((violation, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            {violation}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>All Budgets Within Limits</AlertTitle>
                      <AlertDescription>
                        All performance metrics are within the defined budget thresholds.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bundle" className="space-y-4">
              {bundleInfo ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bundle Analysis</CardTitle>
                      <CardDescription>
                        Breakdown of JavaScript and CSS bundles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bundleInfo.chunks.map((chunk, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <span className="font-medium">{chunk.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {chunk.type.toUpperCase()}
                                </Badge>
                              </div>
                              <span className="font-mono text-sm">
                                {chunk.size.toFixed(1)}KB
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total Bundle Size</span>
                            <span>{bundleInfo.totalSize.toFixed(1)}KB</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {bundleInfo.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                            <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Bundle Analysis Unavailable</AlertTitle>
                  <AlertDescription>
                    Bundle analysis is only available in development mode.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Performance monitoring active • Data updates in real-time
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const data = { metrics, resources, memory, budget }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `performance-report-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Development performance trigger
export function PerformanceTrigger() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>
      <PerformanceDashboard isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}