'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LazyImage } from './lazy-image'
import { ImagePerformanceTracker } from '@/lib/performance'

interface MasonryImage {
  id: string
  url: string
  alt: string
  title?: string
  description?: string
  category?: string
  aspectRatio?: number
}

interface MasonryGalleryProps {
  images: MasonryImage[]
  columns?: number
  gap?: number
  className?: string
  onImageClick?: (image: MasonryImage, index: number) => void
}

export function MasonryGallery({ 
  images, 
  columns = 3, 
  gap = 16,
  className = '',
  onImageClick 
}: MasonryGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (imageId: string, src: string, startTime: number) => {
    setLoadedImages(prev => new Set([...prev, imageId]))
    ImagePerformanceTracker.trackImageLoad(src, startTime)
  }

  const handleImageError = (src: string) => {
    ImagePerformanceTracker.trackImageError(src)
  }

  // Create columns
  const createColumns = () => {
    const cols: MasonryImage[][] = Array.from({ length: columns }, () => [])
    
    images.forEach((image, index) => {
      const columnIndex = index % columns
      cols[columnIndex].push(image)
    })
    
    return cols
  }

  const imageColumns = createColumns()

  if (images.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-8xl mb-6">📷</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No photos yet</h3>
        <p className="text-gray-500">Upload some beautiful moments to get started!</p>
      </div>
    )
  }

  return (
    <div 
      className={`flex ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {imageColumns.map((column, columnIndex) => (
        <div 
          key={columnIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column.map((image, imageIndex) => {
            const globalIndex = columnIndex + imageIndex * columns
            const isLoaded = loadedImages.has(image.id)
            const startTime = performance.now()
            
            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: globalIndex * 0.1 }}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => onImageClick?.(image, globalIndex)}
              >
                <div className="relative">
                  <LazyImage
                    src={image.url}
                    alt={image.alt}
                    width={400}
                    height={image.aspectRatio ? 400 / image.aspectRatio : 300}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    onLoad={() => handleImageLoad(image.id, image.url, startTime)}
                    onError={() => handleImageError(image.url)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={globalIndex < 6} // Prioritize first 6 images
                    placeholder="blur"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Image info - only show category if needed */}
                {image.category && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-block bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {image.category}
                    </span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}