'use client'

import { useEffect } from 'react'
import { reportWebVitals, initializePerformanceMonitoring } from '@/lib/performance'
import { registerServiceWorker, setupInstallPrompt, setupNetworkMonitoring } from '@/lib/service-worker'

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()

    // Register service worker for caching
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker()
      setupInstallPrompt()
    }

    // Setup network monitoring
    setupNetworkMonitoring()

    // Report Web Vitals
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS(reportWebVitals)
        onFCP(reportWebVitals)
        onLCP(reportWebVitals)
        onTTFB(reportWebVitals)
        onINP(reportWebVitals)
      }).catch(() => {
        // web-vitals not available, continue without it
        console.log('Web Vitals library not available')
      })
    }
  }, [])

  return <>{children}</>
}