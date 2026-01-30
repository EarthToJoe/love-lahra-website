'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface DynamicLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

// Default loading component
const DefaultLoader = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-primary-600 rounded-full animate-bounce"></div>
      <div className="w-4 h-4 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-4 h-4 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  </div>
)

// Skeleton loader for different content types
export const SkeletonLoader = ({ 
  type = 'default',
  className 
}: { 
  type?: 'default' | 'card' | 'list' | 'image' | 'text'
  className?: string 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  switch (type) {
    case 'card':
      return (
        <div className={cn('p-4 space-y-4', className)}>
          <div className={cn(baseClasses, 'h-48 w-full')} />
          <div className={cn(baseClasses, 'h-4 w-3/4')} />
          <div className={cn(baseClasses, 'h-4 w-1/2')} />
        </div>
      )
    
    case 'list':
      return (
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className={cn(baseClasses, 'h-10 w-10 rounded-full')} />
              <div className="flex-1 space-y-2">
                <div className={cn(baseClasses, 'h-4 w-3/4')} />
                <div className={cn(baseClasses, 'h-3 w-1/2')} />
              </div>
            </div>
          ))}
        </div>
      )
    
    case 'image':
      return (
        <div className={cn(baseClasses, 'aspect-square w-full', className)} />
      )
    
    case 'text':
      return (
        <div className={cn('space-y-2', className)}>
          <div className={cn(baseClasses, 'h-4 w-full')} />
          <div className={cn(baseClasses, 'h-4 w-5/6')} />
          <div className={cn(baseClasses, 'h-4 w-4/6')} />
        </div>
      )
    
    default:
      return <DefaultLoader className={className} />
  }
}

// Dynamic loader wrapper
export function DynamicLoader({ 
  children, 
  fallback = <DefaultLoader />, 
  className 
}: DynamicLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  )
}

// Higher-order component for dynamic imports
export function withDynamicImport<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const DynamicComponent = lazy(importFn)
  
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultLoader />}>
        <DynamicComponent {...props} />
      </Suspense>
    )
  }
}

// Preload function for dynamic imports
export function preloadComponent(importFn: () => Promise<any>) {
  // Preload the component
  importFn()
}

// Intersection observer based dynamic loading
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  options: {
    threshold?: number
    rootMargin?: string
    triggerOnce?: boolean
  } = {}
) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options
  
  return {
    load: () => importFn(),
    preload: () => preloadComponent(importFn),
  }
}