import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    const supabase = createClient()

    // Get overview statistics
    const [
      contextEntries,
      podResources,
      sharedResources,
      bsvAttestations,
      micropayments
    ] = await Promise.all([
      supabase
        .from('context_entry')
        .select('id')
        .eq('user_id', session.user.id),
      
      supabase
        .from('pod_resource')
        .select('id')
        .eq('user_id', session.user.id),
      
      supabase
        .from('shared_resource')
        .select('id, total_earnings_satoshis, total_access_count')
        .eq('user_id', session.user.id),
      
      supabase
        .from('bsv_attestation')
        .select('id')
        .eq('user_id', session.user.id),
      
      supabase
        .from('micropayment')
        .select('amount_satoshis, created_at')
        .eq('seller_user_id', session.user.id)
        .gte('created_at', startDate.toISOString())
    ])

    // Calculate totals
    const totalEarnings = sharedResources.data?.reduce((sum, resource) => 
      sum + (resource.total_earnings_satoshis || 0), 0) || 0
    
    const totalAccesses = sharedResources.data?.reduce((sum, resource) => 
      sum + (resource.total_access_count || 0), 0) || 0

    // Get top earning resources
    const topResourcesQuery = await supabase
      .from('shared_resource')
      .select(`
        id,
        resource_type,
        resource_id,
        total_earnings_satoshis,
        total_access_count,
        price_satoshis,
        context_entry:resource_id(title),
        pod_resource:resource_id(resource_path)
      `)
      .eq('user_id', session.user.id)
      .order('total_earnings_satoshis', { ascending: false })
      .limit(10)

    const topResources = topResourcesQuery.data?.map(resource => ({
      id: resource.id.toString(),
      title: resource.context_entry?.title || 
             resource.pod_resource?.resource_path?.split('/').pop() || 
             'Untitled Resource',
      type: resource.resource_type,
      earnings: resource.total_earnings_satoshis || 0,
      accesses: resource.total_access_count || 0,
      price: resource.price_satoshis || 0
    })) || []

    // Get daily earnings
    const dailyEarnings: Array<{ date: string; amount: number; transactions: number }> = []
    
    // Group micropayments by date
    const paymentsByDate = new Map<string, { amount: number; count: number }>()
    
    micropayments.data?.forEach(payment => {
      const date = payment.created_at.split('T')[0]
      const existing = paymentsByDate.get(date) || { amount: 0, count: 0 }
      paymentsByDate.set(date, {
        amount: existing.amount + payment.amount_satoshis,
        count: existing.count + 1
      })
    })

    // Fill in missing dates with zeros
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const data = paymentsByDate.get(dateStr) || { amount: 0, count: 0 }
      dailyEarnings.push({
        date: dateStr,
        amount: data.amount,
        transactions: data.count
      })
    }

    // Get content type distribution
    const contentTypesQuery = await supabase
      .from('context_entry')
      .select('content_type')
      .eq('user_id', session.user.id)

    const contentByType = new Map<string, number>()
    contentTypesQuery.data?.forEach(entry => {
      const count = contentByType.get(entry.content_type) || 0
      contentByType.set(entry.content_type, count + 1)
    })

    // Add pod resources as a type
    if (podResources.data && podResources.data.length > 0) {
      contentByType.set('pod_resource', podResources.data.length)
    }

    // Get popular tags
    const tagsQuery = await supabase
      .from('context_entry')
      .select('tags')
      .eq('user_id', session.user.id)
      .not('tags', 'is', null)

    const tagCounts = new Map<string, number>()
    tagsQuery.data?.forEach(entry => {
      entry.tags?.forEach((tag: string) => {
        const count = tagCounts.get(tag) || 0
        tagCounts.set(tag, count + 1)
      })
    })

    const popularTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Get recent blockchain transactions
    const recentTransactionsQuery = await supabase
      .from('bsv_attestation')
      .select(`
        tx_hash,
        attestation_type,
        created_at,
        context_entry:resource_id(title),
        pod_resource:resource_id(resource_path)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const recentTransactions = recentTransactionsQuery.data?.map(tx => ({
      txid: tx.tx_hash,
      type: tx.attestation_type,
      resourceTitle: tx.context_entry?.title || 
                    tx.pod_resource?.resource_path?.split('/').pop() || 
                    'Unknown Resource',
      timestamp: tx.created_at,
      status: 'confirmed' // Simplified - in real app would check actual status
    })) || []

    // Prepare response
    const analyticsData = {
      overview: {
        totalContextEntries: contextEntries.data?.length || 0,
        totalPodResources: podResources.data?.length || 0,
        totalSharedResources: sharedResources.data?.length || 0,
        totalNotarizations: bsvAttestations.data?.length || 0,
        totalEarnings,
        totalAccesses
      },
      earnings: {
        daily: dailyEarnings,
        topResources
      },
      usage: {
        contentByType: Array.from(contentByType.entries()).map(([type, count]) => ({ type, count })),
        accessHistory: [], // Could be implemented with more detailed tracking
        popularTags
      },
      blockchain: {
        totalNotarizations: bsvAttestations.data?.length || 0,
        totalFees: 0, // Could be calculated from transaction data
        avgConfirmationTime: 10, // Mock value - would be calculated from real data
        recentTransactions
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}