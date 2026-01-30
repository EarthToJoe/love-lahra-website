import React from 'react'

// Client-side caching utilities

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 100 // Maximum number of items to cache

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
const cache = new MemoryCache()

// Cleanup expired items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

// Cache wrapper for API calls
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`
  
  // Try to get from cache first
  const cached = cache.get<T>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch from API
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  // Cache the result
  cache.set(cacheKey, data, ttlMs)
  
  return data
}

// Specialized cache functions
export const imageCache = {
  set: (url: string, data: any, ttl = 30 * 60 * 1000) => cache.set(`img:${url}`, data, ttl),
  get: (url: string) => cache.get(`img:${url}`),
  has: (url: string) => cache.has(`img:${url}`),
}

export const apiCache = {
  set: (endpoint: string, data: any, ttl = 5 * 60 * 1000) => cache.set(`api:${endpoint}`, data, ttl),
  get: (endpoint: string) => cache.get(`api:${endpoint}`),
  has: (endpoint: string) => cache.has(`api:${endpoint}`),
  invalidate: (pattern: string) => {
    // Invalidate all cache keys matching pattern
    for (const key of Array.from(cache['cache'].keys())) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  },
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) {
  const [data, setData] = React.useState<T | null>(cache.get(key))
  const [loading, setLoading] = React.useState(!cache.has(key))
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (cache.has(key)) {
      setData(cache.get(key))
      setLoading(false)
      return
    }

    setLoading(true)
    fetcher()
      .then((result) => {
        cache.set(key, result, ttl)
        setData(result)
        setError(null)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key, ttl])

  return { data, loading, error }
}

// Service Worker cache (if available)
export const swCache = {
  async set(key: string, data: any): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1')
        const response = new Response(JSON.stringify(data))
        await cache.put(key, response)
      } catch (error) {
        console.warn('Service Worker cache not available:', error)
      }
    }
  },

  async get(key: string): Promise<any | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1')
        const response = await cache.match(key)
        if (response) {
          return await response.json()
        }
      } catch (error) {
        console.warn('Service Worker cache not available:', error)
      }
    }
    return null
  },

  async delete(key: string): Promise<boolean> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1')
        return await cache.delete(key)
      } catch (error) {
        console.warn('Service Worker cache not available:', error)
      }
    }
    return false
  },
}

export default cache