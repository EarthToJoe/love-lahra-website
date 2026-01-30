'use client'

import { useState } from 'react'
import { PhotoHero } from '@/components/ui/photo-hero'
import { MasonryGallery } from '@/components/ui/masonry-gallery'
import { ImageGallery } from '@/components/ui/image-gallery'
import { motion } from 'framer-motion'

// Mock data - this will come from your database
const mockPhotos = [
  {
    id: '1',
    url: '/api/placeholder/800/600',
    alt: 'Lahra in elegant navy dress',
    title: "Today's Sophisticated Look",
    category: 'outfits',
    aspectRatio: 0.75
  },
  {
    id: '2', 
    url: '/api/placeholder/600/800',
    alt: 'Gourmet dining experience',
    title: 'Dinner at Le Bernardin',
    category: 'dining',
    aspectRatio: 1.33
  },
  {
    id: '3',
    url: '/api/placeholder/700/500',
    alt: 'Morning coffee setup',
    title: 'Perfect Morning Ritual',
    category: 'daily',
    aspectRatio: 0.71
  },
  {
    id: '4',
    url: '/api/placeholder/500/700',
    alt: 'Artisanal pastry',
    title: 'French Macarons',
    category: 'snacks',
    aspectRatio: 1.4
  },
  {
    id: '5',
    url: '/api/placeholder/800/500',
    alt: 'Cozy reading nook',
    title: 'Sunday Reading',
    category: 'daily',
    aspectRatio: 0.625
  },
  {
    id: '6',
    url: '/api/placeholder/600/900',
    alt: 'Designer handbag collection',
    title: 'Handbag Essentials',
    category: 'outfits',
    aspectRatio: 1.5
  }
]

interface PhotoShowcaseProps {
  className?: string
}

export function PhotoShowcase({ className = '' }: PhotoShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [lightboxImage, setLightboxImage] = useState<any>(null)

  const categories = [
    { value: 'all', label: 'All', icon: '✨' },
    { value: 'outfits', label: 'Style', icon: '👗' },
    { value: 'dining', label: 'Dining', icon: '🍽️' },
    { value: 'daily', label: 'Daily', icon: '☀️' },
    { value: 'snacks', label: 'Treats', icon: '🥐' }
  ]

  const filteredPhotos = selectedCategory === 'all' 
    ? mockPhotos 
    : mockPhotos.filter(photo => photo.category === selectedCategory)

  const featuredPhotos = mockPhotos.slice(0, 3) // Top 3 for hero carousel

  const handleImageClick = (image: any, index: number) => {
    setLightboxImage(image)
  }

  return (
    <div className={`${className}`}>
      {/* Hero Photo Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <PhotoHero 
          photos={featuredPhotos}
          autoSlide={true}
          slideInterval={6000}
          className="mb-8"
        />
        
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to My Visual Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every photo tells a story. From daily moments to special occasions, 
            explore the visual diary of my sophisticated lifestyle.
          </p>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category.value
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Photo Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <MasonryGallery
          images={filteredPhotos}
          columns={3}
          gap={20}
          onImageClick={handleImageClick}
          className="mb-12"
        />
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{mockPhotos.length}</div>
            <div className="text-gray-600">Moments Captured</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {new Set(mockPhotos.map(p => p.category)).size}
            </div>
            <div className="text-gray-600">Life Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600 mb-2">∞</div>
            <div className="text-gray-600">Stories to Tell</div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {lightboxImage.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
                <h3 className="font-semibold mb-1">{lightboxImage.title}</h3>
                <span className="text-sm text-gray-300">{lightboxImage.category}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}