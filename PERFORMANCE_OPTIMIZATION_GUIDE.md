# Performance Optimization Guide

## Overview

This guide outlines the performance optimization strategies implemented in Lahra's Life and provides recommendations for maintaining optimal performance in production.

## Performance Monitoring

### Automated Monitoring

The application includes comprehensive performance monitoring:

- **API Response Times**: Tracks all API endpoint performance
- **Database Query Performance**: Monitors query execution times
- **Memory Usage**: Tracks heap usage and garbage collection
- **Real-time Features**: Monitors Socket.io connection and message performance
- **Image Loading**: Tracks image load times and failures
- **Web Vitals**: Monitors Core Web Vitals (CLS, FID, FCP, LCP, TTFB, INP)

### Performance Thresholds

Default performance thresholds:
- API Response Time: 500ms
- Database Query Time: 200ms
- Page Load Time: 2000ms
- Real-time Latency: 100ms
- Memory Usage Warning: 500MB

### Accessing Performance Data

**Admin Dashboard**: `/api/admin/performance`
- JSON format: `GET /api/admin/performance`
- Text report: `GET /api/admin/performance?format=text`
- Reset metrics: `POST /api/admin/performance/reset`

## Database Optimization

### Query Optimization

1. **Use Proper Indexing**
   ```sql
   -- Index on frequently queried columns
   CREATE INDEX idx_comments_content_id ON comments(content_id);
   CREATE INDEX idx_votes_poll_id ON votes(poll_id);
   CREATE INDEX idx_users_email ON users(email);
   ```

2. **Optimize Prisma Queries**
   ```typescript
   // Good: Use select to limit fields
   const users = await prisma.user.findMany({
     select: {
       id: true,
       displayName: true,
       avatar: true
     }
   })

   // Good: Use pagination
   const comments = await prisma.comment.findMany({
     take: 20,
     skip: page * 20,
     orderBy: { createdAt: 'desc' }
   })
   ```

3. **Use Connection Pooling**
   ```typescript
   // Configure in prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     // Connection pool settings
     connection_limit = 20
   }
   ```

### Database Performance Monitoring

```typescript
import { measureDatabaseQuery } from '@/lib/performance'

class CommentService {
  @measureDatabaseQuery('get_comments_with_replies')
  async getCommentsWithReplies(contentId: string) {
    return await prisma.comment.findMany({
      where: { contentId },
      include: { replies: true, user: true }
    })
  }
}
```

## API Optimization

### Response Time Optimization

1. **Use Caching**
   ```typescript
   import { PerformanceOptimizer } from '@/lib/performance'

   // Memoize expensive calculations
   const getExpensiveData = PerformanceOptimizer.memoize(
     async (id: string) => {
       return await expensiveOperation(id)
     }
   )
   ```

2. **Implement Pagination**
   ```typescript
   // Always paginate large datasets
   export async function GET(request: NextRequest) {
     const limit = parseInt(searchParams.get('limit') || '20')
     const offset = parseInt(searchParams.get('offset') || '0')
     
     const results = await prisma.model.findMany({
       take: limit,
       skip: offset
     })
   }
   ```

3. **Use Compression**
   ```typescript
   // Enable gzip compression in next.config.js
   module.exports = {
     compress: true,
     experimental: {
       gzipSize: true
     }
   }
   ```

### API Performance Monitoring

```typescript
import { measureAPICall } from '@/lib/performance'

class APIHandler {
  @measureAPICall('/api/comments', 'GET')
  async getComments(request: NextRequest) {
    // API implementation
  }
}
```

## Frontend Optimization

### Image Optimization

1. **Use Next.js Image Component**
   ```tsx
   import Image from 'next/image'

   <Image
     src="/image.jpg"
     alt="Description"
     width={800}
     height={600}
     priority={isAboveFold}
     placeholder="blur"
     blurDataURL="data:image/jpeg;base64,..."
   />
   ```

2. **Implement Lazy Loading**
   ```tsx
   import { LazyImage } from '@/components/ui/lazy-image'

   <LazyImage
     src="/image.jpg"
     alt="Description"
     onLoad={(loadTime) => {
       ImagePerformanceTracker.trackImageLoad(src, loadTime)
     }}
     onError={() => {
       ImagePerformanceTracker.trackImageError(src)
     }}
   />
   ```

### Code Splitting

1. **Dynamic Imports**
   ```typescript
   // Lazy load heavy components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <div>Loading...</div>,
     ssr: false
   })
   ```

2. **Route-based Splitting**
   ```typescript
   // Automatic with Next.js App Router
   // Each page in app/ directory is automatically code-split
   ```

### Bundle Optimization

1. **Analyze Bundle Size**
   ```bash
   npm run build
   npm run analyze # If configured
   ```

2. **Tree Shaking**
   ```typescript
   // Import only what you need
   import { debounce } from 'lodash/debounce' // Good
   import _ from 'lodash' // Bad - imports entire library
   ```

## Memory Optimization

### Memory Monitoring

```typescript
import { MemoryMonitor } from '@/lib/performance'

// Start monitoring memory usage
const stopMonitoring = MemoryMonitor.startMonitoring(30000) // Every 30 seconds

// Get current memory stats
const stats = MemoryMonitor.getMemoryStats()
console.log('Memory usage:', stats)
```

### Memory Best Practices

1. **Avoid Memory Leaks**
   ```typescript
   // Clean up event listeners
   useEffect(() => {
     const handler = () => { /* ... */ }
     window.addEventListener('resize', handler)
     
     return () => {
       window.removeEventListener('resize', handler)
     }
   }, [])
   ```

2. **Use Weak References**
   ```typescript
   // Use WeakMap for object associations
   const cache = new WeakMap()
   ```

3. **Limit Cache Size**
   ```typescript
   class LimitedCache<K, V> {
     private cache = new Map<K, V>()
     private maxSize = 1000

     set(key: K, value: V) {
       if (this.cache.size >= this.maxSize) {
         const firstKey = this.cache.keys().next().value
         this.cache.delete(firstKey)
       }
       this.cache.set(key, value)
     }
   }
   ```

## Real-time Performance

### Socket.io Optimization

1. **Monitor Connection Count**
   ```typescript
   import { RealTimePerformanceMonitor } from '@/lib/performance'

   io.on('connection', (socket) => {
     RealTimePerformanceMonitor.incrementConnections()
     
     socket.on('disconnect', () => {
       RealTimePerformanceMonitor.decrementConnections()
     })
   })
   ```

2. **Optimize Message Size**
   ```typescript
   // Send only necessary data
   socket.emit('poll-update', {
     pollId: poll.id,
     results: poll.options.map(opt => ({
       id: opt.id,
       voteCount: opt.voteCount
     }))
   })
   ```

3. **Use Rooms Efficiently**
   ```typescript
   // Join specific rooms to reduce broadcast overhead
   socket.join(`poll-${pollId}`)
   socket.join(`user-${userId}`)
   
   // Broadcast only to relevant users
   io.to(`poll-${pollId}`).emit('poll-updated', data)
   ```

## Performance Testing

### Load Testing

Run performance tests:
```bash
npm test -- src/test/performance/load-testing.test.ts
```

### Continuous Monitoring

1. **Set up Performance Alerts**
   ```typescript
   // Monitor performance thresholds
   if (responseTime > THRESHOLD) {
     console.warn(`Slow response: ${endpoint} took ${responseTime}ms`)
     // Send alert to monitoring service
   }
   ```

2. **Regular Performance Reports**
   ```typescript
   // Generate daily performance reports
   setInterval(() => {
     const report = generatePerformanceReport()
     console.log(report)
     // Send to logging service
   }, 24 * 60 * 60 * 1000) // Daily
   ```

## Production Optimization

### Server Configuration

1. **Enable HTTP/2**
   ```nginx
   server {
     listen 443 ssl http2;
     # ... SSL configuration
   }
   ```

2. **Configure Caching Headers**
   ```typescript
   // In API routes
   return NextResponse.json(data, {
     headers: {
       'Cache-Control': 'public, max-age=3600', // 1 hour
       'ETag': generateETag(data)
     }
   })
   ```

3. **Use CDN for Static Assets**
   ```typescript
   // Configure in next.config.js
   module.exports = {
     images: {
       domains: ['cdn.example.com'],
       loader: 'custom',
       loaderFile: './image-loader.js'
     }
   }
   ```

### Database Configuration

1. **Connection Pooling**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
   ```

2. **Read Replicas**
   ```typescript
   // Use read replicas for read-heavy operations
   const readOnlyPrisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_READ_URL
       }
     }
   })
   ```

## Performance Checklist

### Pre-deployment

- [ ] Run performance tests
- [ ] Check bundle size
- [ ] Verify image optimization
- [ ] Test with production data volume
- [ ] Validate caching strategies
- [ ] Review database query performance

### Post-deployment

- [ ] Monitor API response times
- [ ] Track memory usage
- [ ] Monitor database performance
- [ ] Check real-time feature performance
- [ ] Review error rates
- [ ] Analyze user experience metrics

### Regular Maintenance

- [ ] Weekly performance reports
- [ ] Monthly performance optimization review
- [ ] Quarterly load testing
- [ ] Annual architecture review

## Troubleshooting

### Common Performance Issues

1. **Slow API Responses**
   - Check database query performance
   - Verify proper indexing
   - Review N+1 query problems
   - Check for blocking operations

2. **High Memory Usage**
   - Look for memory leaks
   - Review cache sizes
   - Check for circular references
   - Monitor garbage collection

3. **Poor Real-time Performance**
   - Check connection count
   - Review message sizes
   - Verify room usage
   - Monitor server resources

### Performance Debugging

```typescript
// Enable detailed performance logging
process.env.DEBUG_PERFORMANCE = 'true'

// Use performance profiler
import { PerformanceProfiler } from '@/lib/performance'

const profiler = new PerformanceProfiler('complex-operation')
// ... operation steps
profiler.checkpoint('step-1')
// ... more steps
profiler.checkpoint('step-2')
const profile = profiler.finish()
console.log('Performance profile:', profile)
```

## Conclusion

Performance optimization is an ongoing process. Regular monitoring, testing, and optimization ensure that Lahra's Life maintains excellent performance as it scales. Use the provided tools and follow the best practices outlined in this guide to maintain optimal performance.