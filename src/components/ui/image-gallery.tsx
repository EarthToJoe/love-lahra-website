'use client'

import { useState } from 'react'
import { LazyImage } from './lazy-image'
import { ImagePerformanceTracker } from '@/lib/performance'

interface ImageItem {
  id: string
  url: string
  alt: string
  title?: string
  description?: string
  category?: string
  uploadedAt?: string
}

interface ImageGalleryProps {
  images: ImageItem[]
  columns?: number
  showLightbox?: boolean
  className?: string
}

export function ImageGallery({ 
  images, 
  columns = 3, 
  showLightbox = true,
  className = '' 
}: ImageGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (image: ImageItem, index: number) => {
    if (showLightbox) {
      setLightboxImage(image)
      setCurrentIndex(index)
    }
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length
    
    setCurrentIndex(newIndex)
    setLightboxImage(images[newIndex])
  }

  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const handleImageLoad = (src: string, startTime: number) => {
    ImagePerformanceTracker.trackImageLoad(src, startTime)
  }

  const handleImageError = (src: string) => {
    ImagePerformanceTracker.trackImageError(src)
  }

  if (images.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">📷</div>
        <p className="text-gray-500 text-lg">No images yet</p>
        <p className="text-gray-400 text-sm">Upload some photos to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className={`grid ${getGridCols()} gap-6 ${className}`}>
        {images.map((image, index) => {
          const startTime = performance.now()
          
          return (
            <div
              key={image.id}
              className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => openLightbox(image, index)}
            >
              <div className="aspect-square relative">
                <LazyImage
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 6} // Prioritize first 6 images
                  placeholder="blur"
                  onLoad={() => handleImageLoad(image.url, startTime)}
                  onError={() => handleImageError(image.url)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
              </div>
              
              {/* Image info - minimal overlay */}
              {(image.title || image.description) && (
                <div className="p-4">
                  {image.description && (
                    <p className="text-gray-600 text-sm">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxImage && showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-md p-2"
              aria-label="Close lightbox"
            >
              ✕
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-md p-2"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-md p-2"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <LazyImage
                src={lightboxImage.url}
                alt={lightboxImage.alt}
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain"
                priority
              />
            </div>

            {/* Image info - remove title display */}
            {(lightboxImage.title || lightboxImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                {lightboxImage.description && (
                  <p className="text-sm text-gray-300">{lightboxImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}