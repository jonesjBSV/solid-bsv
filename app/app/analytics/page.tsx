'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Download,
  Shield,
  Calendar,
  Bitcoin,
  Database,
  Zap,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface AnalyticsData {
  overview: {
    totalContextEntries: number
    totalPodResources: number
    totalSharedResources: number
    totalNotarizations: number
    totalEarnings: number
    totalAccesses: number
  }
  earnings: {
    daily: Array<{ date: string; amount: number; transactions: number }>
    topResources: Array<{
      id: string
      title: string
      type: string
      earnings: number
      accesses: number
      price: number
    }>
  }
  usage: {
    contentByType: Array<{ type: string; count: number }>
    accessHistory: Array<{
      date: string
      accesses: number
      uniqueUsers: number
    }>
    popularTags: Array<{ tag: string; count: number }>
  }
  blockchain: {
    totalNotarizations: number
    totalFees: number
    avgConfirmationTime: number
    recentTransactions: Array<{
      txid: string
      type: string
      resourceTitle: string
      timestamp: string
      status: string
    }>
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeRange=${selectedTimeRange}`)
      if (!response.ok) throw new Error('Failed to load analytics')
      
      const data = await response.json()
      setAnalytics(data)

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
    toast({
      title: 'Refreshed',
      description: 'Analytics data has been updated',
    })
  }

  const formatSatoshis = (satoshis: number) => {
    const bsv = satoshis / 100000000
    return `${bsv.toFixed(8)} BSV (${satoshis.toLocaleString()} sats)`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (isLoading && !analytics) {
    return (
      <div className="container max-w-6xl py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor your SOLID+BSV usage, earnings, and performance
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
              <p className="text-sm text-muted-foreground">
                Start creating content and sharing resources to see analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your SOLID+BSV usage, earnings, and performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatSatoshis(analytics.overview.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {analytics.overview.totalAccesses} total accesses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Created</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalContextEntries + analytics.overview.totalPodResources}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.totalContextEntries} context, {analytics.overview.totalPodResources} pod files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Resources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalSharedResources}
            </div>
            <p className="text-xs text-muted-foreground">
              Available in marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BSV Notarizations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalNotarizations}
            </div>
            <p className="text-xs text-muted-foreground">
              Blockchain attestations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Earning Resources</CardTitle>
                <CardDescription>
                  Your most profitable shared content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.earnings.topResources.map((resource, index) => (
                    <div key={resource.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium text-sm">{resource.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {resource.accesses} accesses • {formatSatoshis(resource.price)} each
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatSatoshis(resource.earnings)}</div>
                      </div>
                    </div>
                  ))}
                  
                  {analytics.earnings.topResources.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-2" />
                      <p>No earnings yet</p>
                      <p className="text-xs">Share resources to start earning</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Earnings</CardTitle>
                <CardDescription>
                  Revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.earnings.daily.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatSatoshis(day.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.transactions} transaction{day.transactions !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}

                  {analytics.earnings.daily.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2" />
                      <p>No earnings data</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content by Type</CardTitle>
                <CardDescription>
                  Distribution of your content types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.usage.contentByType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{item.type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.usage.contentByType.map(c => c.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
                <CardDescription>
                  Most used tags in your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.usage.popularTags.map((tag) => (
                    <Badge key={tag.tag} variant="outline" className="text-xs">
                      {tag.tag} ({tag.count})
                    </Badge>
                  ))}

                  {analytics.usage.popularTags.length === 0 && (
                    <div className="text-center w-full py-8 text-muted-foreground">
                      <p>No tags used yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Stats</CardTitle>
                <CardDescription>
                  BSV blockchain activity overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Notarizations</span>
                    <span className="font-medium">{analytics.blockchain.totalNotarizations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Fees Paid</span>
                    <span className="font-medium">{formatSatoshis(analytics.blockchain.totalFees)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Confirmation Time</span>
                    <span className="font-medium">{analytics.blockchain.avgConfirmationTime}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest BSV blockchain activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.blockchain.recentTransactions.map((tx) => (
                    <div key={tx.txid} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{tx.resourceTitle}</span>
                        <Badge 
                          variant={tx.status === 'confirmed' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{tx.type}</span>
                        <span>{formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}</span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {tx.txid.slice(0, 16)}...{tx.txid.slice(-8)}
                      </div>
                    </div>
                  ))}

                  {analytics.blockchain.recentTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bitcoin className="h-8 w-8 mx-auto mb-2" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                How your content is performing in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Accesses</TableHead>
                    <TableHead>Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.earnings.topResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{resource.accesses}</TableCell>
                      <TableCell>{formatSatoshis(resource.earnings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {analytics.earnings.topResources.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>No content performance data</p>
                  <p className="text-xs">Share resources to see performance metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}