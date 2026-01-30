'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LazyImage } from './lazy-image'

interface PhotoHeroProps {
  photos: Array<{
    id: string
    url: string
    alt: string
    title?: string
    category?: string
  }>
  autoSlide?: boolean
  slideInterval?: number
  className?: string
}

export function PhotoHero({ 
  photos, 
  autoSlide = true, 
  slideInterval = 5000,
  className = '' 
}: PhotoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoSlide || photos.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, slideInterval)

    return () => clearInterval(interval)
  }, [autoSlide, slideInterval, photos.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (photos.length <= 1) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentIndex((prev) => (prev + 1) % photos.length)
          break
        case 'Home':
          e.preventDefault()
          setCurrentIndex(0)
          break
        case 'End':
          e.preventDefault()
          setCurrentIndex(photos.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [photos.length])

  if (photos.length === 0) {
    return (
      <div className={`relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4" aria-hidden="true">📸</div>
          <p className="text-gray-500 text-lg">No photos yet</p>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div 
      className={`relative h-96 md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl ${className}`}
      role="region"
      aria-label="Featured photos carousel"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <LazyImage
            src={currentPhoto.url}
            alt={currentPhoto.alt}
            fill
            className="object-cover"
            priority={currentIndex === 0} // Prioritize first image
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            placeholder="blur"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
          
          {/* Content overlay - remove title display */}
          {currentPhoto.category && (
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <motion.span 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                aria-label={`Photo category: ${currentPhoto.category}`}
              >
                {currentPhoto.category}
              </motion.span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
          role="tablist"
          aria-label="Photo navigation"
        >
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`View photo ${index + 1}: ${photo.alt}`}
              tabIndex={index === currentIndex ? 0 : -1}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
            aria-label="Previous photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
            aria-label="Next photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}