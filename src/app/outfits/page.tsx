'use client'

import { useImages } from '@/hooks/useImages'
import { MasonryGallery } from '@/components/ui/masonry-gallery'
import { PageHeader } from '@/components/layout/page-header'
import { CommentSystem } from '@/components/features/comment-system'
import { useState } from 'react'
import Link from 'next/link'

export default function OutfitsPage() {
  const { images, loading, error } = useImages('outfits')
  const [lightboxImage, setLightboxImage] = useState<any>(null)

  const handleImageClick = (image: any, index: number) => {
    setLightboxImage(image)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading style moments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading photos: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="Style" />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Style & Fashion
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every outfit tells a story. From sophisticated evening looks to casual chic, 
              explore my fashion journey and the inspiration behind each style choice.
            </p>
            
            {images.length > 0 && (
              <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👗</span>
                  <span>{images.length} style moments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📸</span>
                  <span>Latest uploads</span>
                </div>
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          {images.length > 0 ? (
            <MasonryGallery
              images={images.map(img => ({
                ...img,
                aspectRatio: Math.random() * 0.5 + 0.7 // Random aspect ratios for masonry effect
              }))}
              columns={3}
              gap={20}
              onImageClick={handleImageClick}
            />
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">👗</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No style photos yet</h3>
              <p className="text-gray-500 mb-6">Upload some outfit photos to start building your style diary!</p>
              <a 
                href="/admin/images" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Photos
              </a>
            </div>
          )}

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
                {lightboxImage && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>Style & Fashion</span>
                      <span>{new Date(lightboxImage.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <CommentSystem
              contentId="outfits-general"
              contentType="CONTENT_SECTION"
              className="bg-white rounded-2xl shadow-lg p-8"
            />
          </div>
      </main>
    </div>
  )
}