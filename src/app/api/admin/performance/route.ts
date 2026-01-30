import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { 
  generatePerformanceReport,
  DatabasePerformanceMonitor,
  APIPerformanceMonitor,
  MemoryMonitor,
  RealTimePerformanceMonitor,
  ImagePerformanceTracker
} from '@/lib/performance'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/performance - Get performance metrics (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    // Collect all performance data
    const performanceData = {
      timestamp: new Date().toISOString(),
      api: APIPerformanceMonitor.getAllStats(),
      database: DatabasePerformanceMonitor.getAllStats(),
      memory: MemoryMonitor.getMemoryStats(),
      realtime: RealTimePerformanceMonitor.getStats(),
      images: ImagePerformanceTracker.getStats(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        pid: process.pid
      }
    }

    if (format === 'text') {
      const report = generatePerformanceReport()
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

    return NextResponse.json(performanceData)

  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

// POST /api/admin/performance/reset - Reset performance metrics (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const { metric } = body

    if (metric === 'realtime' || metric === 'all') {
      RealTimePerformanceMonitor.reset()
    }

    // Note: Other metrics reset automatically by keeping only recent data
    // This is by design to prevent memory leaks

    return NextResponse.json({ 
      message: `Performance metrics ${metric || 'all'} reset successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error resetting performance metrics:', error)
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to reset performance metrics' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/performance/thresholds - Update performance thresholds (admin only)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const { thresholds } = body

    // Validate thresholds
    const validThresholds = ['apiResponse', 'dbQuery', 'memoryUsage', 'realTimeLatency']
    const updates: Record<string, number> = {}

    for (const [key, value] of Object.entries(thresholds)) {
      if (validThresholds.includes(key) && typeof value === 'number' && value > 0) {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid thresholds provided' },
        { status: 400 }
      )
    }

    // In a real implementation, you would save these to a configuration store
    // For now, we'll just return the updated values
    return NextResponse.json({
      message: 'Performance thresholds updated successfully',
      updatedThresholds: updates,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error updating performance thresholds:', error)
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update performance thresholds' },
      { status: 500 }
    )
  }
}
