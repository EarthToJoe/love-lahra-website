// Performance monitoring utilities for Core Web Vitals

export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

// Get rating based on metric value
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Report Web Vitals to analytics (placeholder)
export function reportWebVitals(metric: WebVitalsMetric) {
  // In production, you would send this to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric)
  }
  
  // Example: Send to Google Analytics
  // gtag('event', metric.name, {
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   event_category: 'Web Vitals',
  //   event_label: metric.id,
  //   non_interaction: true,
  // })
}

// Performance observer for custom metrics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private observers: PerformanceObserver[] = []

  private constructor() {
    this.initializeObservers()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.reportNavigationMetrics(navEntry)
            }
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)
      } catch (e) {
        console.warn('Navigation timing observer not supported')
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.reportResourceMetrics(entry as PerformanceResourceTiming)
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource timing observer not supported')
      }
    }
  }

  private reportNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
      domComplete: entry.domComplete - entry.fetchStart,
      loadComplete: entry.loadEventEnd - entry.fetchStart,
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Navigation Metrics:', metrics)
    }
  }

  private reportResourceMetrics(entry: PerformanceResourceTiming) {
    // Only report slow resources (> 1s)
    if (entry.duration > 1000) {
      const resourceMetric = {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        type: this.getResourceType(entry.name),
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Slow Resource:', resourceMetric)
      }
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) return 'image'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  // Measure custom performance marks
  measureCustomMetric(name: string, startMark?: string, endMark?: string) {
    if (typeof window === 'undefined') return

    try {
      if (startMark && endMark) {
        performance.measure(name, startMark, endMark)
      } else {
        performance.measure(name)
      }

      const measure = performance.getEntriesByName(name, 'measure')[0]
      if (measure && process.env.NODE_ENV === 'development') {
        console.log(`Custom Metric - ${name}:`, measure.duration, 'ms')
      }
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e)
    }
  }

  // Mark performance points
  mark(name: string) {
    if (typeof window === 'undefined') return

    try {
      performance.mark(name)
    } catch (e) {
      console.warn(`Failed to mark ${name}:`, e)
    }
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Image loading performance tracker
export class ImagePerformanceTracker {
  private static loadTimes = new Map<string, number>()
  private static loadErrors = new Set<string>()

  static trackImageLoad(src: string, startTime: number) {
    const loadTime = performance.now() - startTime
    this.loadTimes.set(src, loadTime)
    
    if (process.env.NODE_ENV === 'development' && loadTime > 2000) {
      console.warn(`Slow image load: ${src} took ${loadTime.toFixed(2)}ms`)
    }
  }

  static trackImageError(src: string) {
    this.loadErrors.add(src)
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Image failed to load: ${src}`)
    }
  }

  static getStats() {
    const loadTimes = Array.from(this.loadTimes.values())
    const avgLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
      : 0

    return {
      totalImages: this.loadTimes.size,
      failedImages: this.loadErrors.size,
      averageLoadTime: avgLoadTime,
      slowImages: loadTimes.filter(time => time > 2000).length,
    }
  }
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

  // Analyze loaded scripts
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))

  console.group('Bundle Analysis')
  console.log('Scripts loaded:', scripts.length)
  console.log('Stylesheets loaded:', stylesheets.length)
  
  // Estimate bundle sizes from resource timing
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const jsResources = resources.filter(r => r.name.includes('.js'))
  const cssResources = resources.filter(r => r.name.includes('.css'))
  
  const totalJSSize = jsResources.reduce((total, resource) => total + (resource.transferSize || 0), 0)
  const totalCSSSize = cssResources.reduce((total, resource) => total + (resource.transferSize || 0), 0)
  
  console.log('Estimated JS bundle size:', (totalJSSize / 1024).toFixed(2), 'KB')
  console.log('Estimated CSS bundle size:', (totalCSSSize / 1024).toFixed(2), 'KB')
  console.groupEnd()
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Initialize performance monitor
  PerformanceMonitor.getInstance()

  // Analyze bundle size in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(analyzeBundleSize, 2000)
  }
}

// Database query performance monitoring
export class DatabasePerformanceMonitor {
  private static queryTimes = new Map<string, number[]>()
  private static slowQueries = new Map<string, number>()

  static recordQuery(queryName: string, duration: number) {
    if (!this.queryTimes.has(queryName)) {
      this.queryTimes.set(queryName, [])
    }
    
    const times = this.queryTimes.get(queryName)!
    times.push(duration)
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift()
    }

    // Track slow queries (> 200ms)
    if (duration > 200) {
      const count = this.slowQueries.get(queryName) || 0
      this.slowQueries.set(queryName, count + 1)
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Slow database query: ${queryName} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  static getQueryStats(queryName: string) {
    const times = this.queryTimes.get(queryName) || []
    if (times.length === 0) return null

    const sorted = [...times].sort((a, b) => a - b)
    return {
      count: times.length,
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      slowQueryCount: this.slowQueries.get(queryName) || 0
    }
  }

  static getAllStats() {
    const stats: Record<string, any> = {}
    for (const queryName of this.queryTimes.keys()) {
      stats[queryName] = this.getQueryStats(queryName)
    }
    return stats
  }
}

// API response time monitoring
export class APIPerformanceMonitor {
  private static responseTimes = new Map<string, number[]>()
  private static errorCounts = new Map<string, number>()

  static recordAPICall(endpoint: string, method: string, duration: number, status: number) {
    const key = `${method} ${endpoint}`
    
    if (!this.responseTimes.has(key)) {
      this.responseTimes.set(key, [])
    }
    
    const times = this.responseTimes.get(key)!
    times.push(duration)
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift()
    }

    // Track errors
    if (status >= 400) {
      const count = this.errorCounts.get(key) || 0
      this.errorCounts.set(key, count + 1)
    }

    // Log slow API calls
    if (duration > 500 && process.env.NODE_ENV === 'development') {
      console.warn(`Slow API call: ${key} took ${duration.toFixed(2)}ms`)
    }
  }

  static getAPIStats(endpoint: string, method: string) {
    const key = `${method} ${endpoint}`
    const times = this.responseTimes.get(key) || []
    if (times.length === 0) return null

    const sorted = [...times].sort((a, b) => a - b)
    return {
      count: times.length,
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      errorCount: this.errorCounts.get(key) || 0,
      errorRate: ((this.errorCounts.get(key) || 0) / times.length) * 100
    }
  }

  static getAllStats() {
    const stats: Record<string, any> = {}
    for (const key of this.responseTimes.keys()) {
      const [method, endpoint] = key.split(' ', 2)
      stats[key] = this.getAPIStats(endpoint, method)
    }
    return stats
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  private static measurements: Array<{ timestamp: number; usage: any }> = []

  static recordMemoryUsage() {
    if (typeof process === 'undefined') return

    const usage = process.memoryUsage()
    const measurement = {
      timestamp: Date.now(),
      usage: {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        rss: Math.round(usage.rss / 1024 / 1024) // MB
      }
    }

    this.measurements.push(measurement)
    
    // Keep only last 100 measurements
    if (this.measurements.length > 100) {
      this.measurements.shift()
    }

    // Warn about high memory usage
    if (usage.heapUsed > 500 * 1024 * 1024 && process.env.NODE_ENV === 'development') { // 500MB
      console.warn(`High memory usage: ${measurement.usage.heapUsed}MB heap used`)
    }
  }

  static getMemoryStats() {
    if (this.measurements.length === 0) return null

    const latest = this.measurements[this.measurements.length - 1]
    const heapUsages = this.measurements.map(m => m.usage.heapUsed)
    
    return {
      current: latest.usage,
      average: heapUsages.reduce((sum, usage) => sum + usage, 0) / heapUsages.length,
      peak: Math.max(...heapUsages),
      measurements: this.measurements.length
    }
  }

  static startMonitoring(intervalMs: number = 30000) {
    if (typeof process === 'undefined') return

    // Record initial measurement
    this.recordMemoryUsage()
    
    // Set up periodic monitoring
    const interval = setInterval(() => {
      this.recordMemoryUsage()
    }, intervalMs)

    return () => clearInterval(interval)
  }
}

// Performance optimization utilities
export const PerformanceOptimizer = {
  // Debounce function calls to reduce load
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function calls to limit frequency
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Batch operations to reduce overhead
  async batchOperations<T>(
    operations: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<void>
  ): Promise<void> {
    const batches: T[][] = []
    for (let i = 0; i < operations.length; i += batchSize) {
      batches.push(operations.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      await processor(batch)
    }
  },

  // Memoize expensive function calls
  memoize<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>()
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      
      if (cache.has(key)) {
        return cache.get(key)!
      }
      
      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  }
}

// Real-time performance monitoring for Socket.io
export class RealTimePerformanceMonitor {
  private static connectionCount = 0
  private static messagesSent = 0
  private static messagesReceived = 0
  private static lastReset = Date.now()

  static incrementConnections(): void {
    this.connectionCount++
  }

  static decrementConnections(): void {
    this.connectionCount = Math.max(0, this.connectionCount - 1)
  }

  static recordMessageSent(size?: number): void {
    this.messagesSent++
    if (size && size > 10000 && process.env.NODE_ENV === 'development') { // 10KB
      console.warn(`Large Socket.io message sent: ${size} bytes`)
    }
  }

  static recordMessageReceived(size?: number): void {
    this.messagesReceived++
    if (size && size > 10000 && process.env.NODE_ENV === 'development') { // 10KB
      console.warn(`Large Socket.io message received: ${size} bytes`)
    }
  }

  static getStats() {
    const now = Date.now()
    const duration = (now - this.lastReset) / 1000 // seconds
    
    return {
      connections: this.connectionCount,
      messagesSent: this.messagesSent,
      messagesReceived: this.messagesReceived,
      messagesPerSecond: {
        sent: duration > 0 ? this.messagesSent / duration : 0,
        received: duration > 0 ? this.messagesReceived / duration : 0
      },
      duration
    }
  }

  static reset(): void {
    this.messagesSent = 0
    this.messagesReceived = 0
    this.lastReset = Date.now()
  }
}

// Performance report generator
export function generatePerformanceReport(): string {
  let report = '=== Performance Report ===\n\n'
  
  // API Performance
  const apiStats = APIPerformanceMonitor.getAllStats()
  if (Object.keys(apiStats).length > 0) {
    report += 'API Performance:\n'
    Object.entries(apiStats).forEach(([endpoint, stats]) => {
      if (stats) {
        report += `  ${endpoint}: avg=${stats.average.toFixed(2)}ms, p95=${stats.p95.toFixed(2)}ms, errors=${stats.errorCount}\n`
      }
    })
    report += '\n'
  }
  
  // Database Performance
  const dbStats = DatabasePerformanceMonitor.getAllStats()
  if (Object.keys(dbStats).length > 0) {
    report += 'Database Performance:\n'
    Object.entries(dbStats).forEach(([query, stats]) => {
      if (stats) {
        report += `  ${query}: avg=${stats.average.toFixed(2)}ms, p95=${stats.p95.toFixed(2)}ms, slow=${stats.slowQueryCount}\n`
      }
    })
    report += '\n'
  }
  
  // Memory Usage
  const memoryStats = MemoryMonitor.getMemoryStats()
  if (memoryStats) {
    report += 'Memory Usage:\n'
    report += `  Current: ${memoryStats.current.heapUsed}MB heap, ${memoryStats.current.rss}MB RSS\n`
    report += `  Average: ${memoryStats.average.toFixed(2)}MB heap\n`
    report += `  Peak: ${memoryStats.peak}MB heap\n\n`
  }
  
  // Real-time Performance
  const realtimeStats = RealTimePerformanceMonitor.getStats()
  report += 'Real-time Performance:\n'
  report += `  Active Connections: ${realtimeStats.connections}\n`
  report += `  Messages/sec: sent=${realtimeStats.messagesPerSecond.sent.toFixed(2)}, received=${realtimeStats.messagesPerSecond.received.toFixed(2)}\n\n`
  
  // Image Performance
  const imageStats = ImagePerformanceTracker.getStats()
  report += 'Image Performance:\n'
  report += `  Total Images: ${imageStats.totalImages}\n`
  report += `  Failed Images: ${imageStats.failedImages}\n`
  report += `  Average Load Time: ${imageStats.averageLoadTime.toFixed(2)}ms\n`
  report += `  Slow Images (>2s): ${imageStats.slowImages}\n`
  
  return report
}

// Initialize comprehensive performance monitoring
export function initializeComprehensivePerformanceMonitoring() {
  // Initialize existing performance monitoring
  initializePerformanceMonitoring()
  
  // Start memory monitoring (every 30 seconds)
  if (typeof process !== 'undefined') {
    MemoryMonitor.startMonitoring(30000)
  }
  
  // Log performance report every 5 minutes in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      console.log(generatePerformanceReport())
    }, 5 * 60 * 1000) // 5 minutes
  }
}

// Export performance monitoring decorators
export function measureDatabaseQuery(queryName: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const startTime = performance.now()
      
      try {
        const result = await originalMethod.apply(this, args)
        const endTime = performance.now()
        DatabasePerformanceMonitor.recordQuery(queryName, endTime - startTime)
        return result
      } catch (error) {
        const endTime = performance.now()
        DatabasePerformanceMonitor.recordQuery(`${queryName}_error`, endTime - startTime)
        throw error
      }
    }

    return descriptor
  }
}

export function measureAPICall(endpoint: string, method: string = 'GET') {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const startTime = performance.now()
      let status = 200
      
      try {
        const result = await originalMethod.apply(this, args)
        const endTime = performance.now()
        APIPerformanceMonitor.recordAPICall(endpoint, method, endTime - startTime, status)
        return result
      } catch (error) {
        status = 500
        const endTime = performance.now()
        APIPerformanceMonitor.recordAPICall(endpoint, method, endTime - startTime, status)
        throw error
      }
    }

    return descriptor
  }
}