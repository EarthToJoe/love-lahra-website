'use client'

import { useState, useEffect } from 'react'
import { useImages } from '@/hooks/useImages'
import { Button } from '@/components/ui/button'

interface ImageOrganizerProps {
  onClose: () => void
}

export function ImageOrganizer({ onClose }: ImageOrganizerProps) {
  const { images: allImages, loading } = useImages()
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [draggedImage, setDraggedImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', 'outfits', 'dining', 'daily', 'snacks', 'general']
  
  const filteredImages = filter === 'all' 
    ? allImages 
    : allImages.filter(img => img.category === filter)

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(img => img.id))
    }
  }

  const handleBulkCategoryChange = async (newCategory: string) => {
    if (selectedImages.length === 0) return
    
    try {
      // In a real app, this would make API calls to update image categories
      console.log(`Moving ${selectedImages.length} images to category: ${newCategory}`)
      
      // Mock success
      alert(`Successfully moved ${selectedImages.length} images to ${newCategory} category`)
      setSelectedImages([])
    } catch (error) {
      console.error('Error updating image categories:', error)
      alert('Error updating image categories. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} images? This cannot be undone.`)) {
      return
    }
    
    try {
      // In a real app, this would make API calls to delete images
      console.log(`Deleting ${selectedImages.length} images`)
      
      // Mock success
      alert(`Successfully deleted ${selectedImages.length} images`)
      setSelectedImages([])
    } catch (error) {
      console.error('Error deleting images:', error)
      alert('Error deleting images. Please try again.')
    }
  }

  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault()
    if (!draggedImage) return
    
    // In a real app, this would update the image category
    console.log(`Moving image ${draggedImage} to category: ${targetCategory}`)
    setDraggedImage(null)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading images...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Image Organizer</h2>
              <p className="text-gray-600">Organize your images by category and manage your photo library</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  {category !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({allImages.filter(img => img.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Selection Controls */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedImages.length} of {filteredImages.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedImages.length === filteredImages.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedImages.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">Move to:</span>
                  {categories.filter(c => c !== 'all').map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkCategoryChange(category)}
                      className="text-xs"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Drop Zones */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Drag images to categories:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.filter(c => c !== 'all').map((category) => (
              <div
                key={category}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category)}
                className={`px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${
                  draggedImage
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No images in {filter === 'all' ? 'your library' : `${filter} category`}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Upload some images to get started organizing your photo library.'
                  : `No images found in the ${filter} category. Try a different filter or upload images.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                    selectedImages.includes(image.id)
                      ? 'ring-2 ring-blue-500'
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                  onClick={() => handleImageSelect(image.id)}
                  draggable
                  onDragStart={() => handleDragStart(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-24 object-cover"
                  />
                  
                  {/* Selection Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                    selectedImages.includes(image.id)
                      ? 'bg-blue-500 bg-opacity-50 opacity-100'
                      : 'bg-black bg-opacity-0 opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedImages.includes(image.id)
                        ? 'bg-blue-500 border-white'
                        : 'border-white'
                    }`}>
                      {selectedImages.includes(image.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-1 left-1">
                    <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {image.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}