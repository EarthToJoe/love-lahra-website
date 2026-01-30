'use client'

import { useState, useEffect } from 'react'
import { useImages } from '@/hooks/useImages'
import { ImageUpload } from '@/components/ui/image-upload'
import { ImageGallery } from '@/components/ui/image-gallery'
import { ImageOrganizer } from '@/components/admin/image-organizer'
import { ContentSection } from '@/components/features/content-section'
import { Button } from '@/components/ui/button'

export default function ImageManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState('outfits')
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showOrganizer, setShowOrganizer] = useState(false)
  
  const { images, loading, error, refetch } = useImages(selectedCategory)

  const categories = [
    { value: 'outfits', label: 'Outfits' },
    { value: 'dining', label: 'Dining' },
    { value: 'daily', label: 'Daily Life' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'general', label: 'General' }
  ]

  const handleUploadSuccess = (fileInfo: any) => {
    setUploadMessage({ type: 'success', text: 'Image uploaded successfully!' })
    
    // Refresh the images list
    refetch()
    
    // Clear message after 3 seconds
    setTimeout(() => setUploadMessage(null), 3000)
  }

  const handleUploadError = (error: string) => {
    setUploadMessage({ type: 'error', text: error })
    
    // Clear message after 5 seconds
    setTimeout(() => setUploadMessage(null), 5000)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <ContentSection title="Image Management" className="pt-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header with Organizer Button */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📸 Photo Library</h1>
                <p className="text-gray-600">
                  Upload, organize, and manage all your photos across different categories.
                </p>
              </div>
              <Button
                onClick={() => setShowOrganizer(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🗂️ Organize Photos
              </Button>
            </div>
            
            {/* Upload Message */}
            {uploadMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                uploadMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {uploadMessage.text}
              </div>
            )}

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload New Image</h3>
              <ImageUpload
                category={selectedCategory}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                className="max-w-md mx-auto"
              />
            </div>

            {/* Gallery */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {categories.find(c => c.value === selectedCategory)?.label} Photos ({images.length})
                </h3>
                
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading images...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <button 
                    onClick={refetch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <ImageGallery 
                  images={images.map(img => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt,
                    description: `Uploaded ${new Date(img.uploadedAt).toLocaleDateString()}`
                  }))}
                  columns={3}
                  showLightbox={true}
                />
              )}
            </div>
          </div>
        </ContentSection>
      </div>

      {/* Image Organizer Modal */}
      {showOrganizer && (
        <ImageOrganizer onClose={() => setShowOrganizer(false)} />
      )}
    </>
  )
}