'use client'

import { useState, useEffect } from 'react'
import { ContentSection, ContentImage } from '@/types'
import { ImageUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ContentEditorProps {
  contentType: 'daily-activity' | 'closet' | 'outfit' | 'dining' | 'snacks' | 'fun-facts' | 'mena-watchlist'
  initialContent?: ContentSection
  onSave: (content: ContentSection) => Promise<void>
  onCancel: () => void
}

export function ContentEditor({ contentType, initialContent, onSave, onCancel }: ContentEditorProps) {
  const [title, setTitle] = useState(initialContent?.title || '')
  const [content, setContent] = useState(initialContent?.content || '')
  const [images, setImages] = useState<ContentImage[]>(initialContent?.images || [])
  const [isPublished, setIsPublished] = useState(initialContent?.isPublished || false)
  const [metadata, setMetadata] = useState<Record<string, any>>(initialContent?.metadata || {})
  const [isSaving, setIsSaving] = useState(false)

  // Content type specific metadata fields
  const getMetadataFields = () => {
    switch (contentType) {
      case 'dining':
        return [
          { key: 'restaurant', label: 'Restaurant Name', type: 'text' },
          { key: 'cuisine', label: 'Cuisine Type', type: 'text' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
          { key: 'visitDate', label: 'Visit Date', type: 'date' },
          { key: 'priceRange', label: 'Price Range', type: 'select', options: ['$', '$$', '$$$', '$$$$'] },
        ]
      case 'outfit':
        return [
          { key: 'occasion', label: 'Occasion', type: 'text' },
          { key: 'season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Fall', 'Winter'] },
          { key: 'style', label: 'Style', type: 'text' },
          { key: 'brands', label: 'Brands (comma separated)', type: 'text' },
        ]
      case 'daily-activity':
        return [
          { key: 'date', label: 'Activity Date', type: 'date' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'mood', label: 'Mood', type: 'select', options: ['😊 Happy', '😌 Relaxed', '🤩 Excited', '😴 Tired', '🤔 Thoughtful'] },
          { key: 'weather', label: 'Weather', type: 'text' },
        ]
      case 'fun-facts':
        return [
          { key: 'category', label: 'Category', type: 'select', options: ['Personal', 'Random', 'Food', 'Travel', 'Fashion', 'Other'] },
          { key: 'isTrivia', label: 'Is Trivia Question?', type: 'checkbox' },
        ]
      case 'mena-watchlist':
        return [
          { key: 'type', label: 'Type', type: 'select', options: ['Movie', 'TV Show', 'Documentary', 'Series'] },
          { key: 'genre', label: 'Genre', type: 'text' },
          { key: 'status', label: 'Status', type: 'select', options: ['Want to Watch', 'Currently Watching', 'Completed', 'On Hold'] },
          { key: 'rating', label: 'Rating (1-10)', type: 'number', min: 1, max: 10 },
        ]
      default:
        return []
    }
  }

  const handleMetadataChange = (key: string, value: any) => {
    setMetadata(prev => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = (uploadedImages: string[]) => {
    const newImages: ContentImage[] = uploadedImages.map((url, index) => ({
      id: `img-${Date.now()}-${index}`,
      url,
      altText: `${contentType} image ${index + 1}`,
      caption: '',
      order: images.length + index,
      metadata: {
        width: 800, // Default values - would be set by upload handler
        height: 600,
        format: 'jpg',
        size: 0,
      }
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const handleImageRemove = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleImageReorder = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = images[dragIndex]
    const newImages = [...images]
    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)
    
    // Update order values
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }))
    
    setImages(reorderedImages)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setIsSaving(true)
    try {
      const contentData: ContentSection = {
        id: initialContent?.id || `content-${Date.now()}`,
        type: contentType,
        title: title.trim(),
        content: content.trim(),
        images,
        metadata,
        isPublished,
        publishedAt: isPublished ? new Date() : undefined,
        createdAt: initialContent?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      await onSave(contentData)
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const metadataFields = getMetadataFields()

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {initialContent ? 'Edit' : 'Create'} {contentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Content
        </h2>
        <p className="text-gray-600">
          {initialContent ? 'Update your content' : 'Create new content'} for the {contentType.replace('-', ' ')} section
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title..."
            className="mt-1"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here..."
            rows={6}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Metadata Fields */}
        {metadataFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metadataFields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === 'select' ? (
                    <select
                      id={field.key}
                      value={metadata[field.key] || ''}
                      onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        id={field.key}
                        checked={metadata[field.key] || false}
                        onChange={(e) => handleMetadataChange(field.key, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={field.key} className="text-sm text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={metadata[field.key] || ''}
                      onChange={(e) => handleMetadataChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                      min={field.min}
                      max={field.max}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
          
          {/* Current Images */}
          {images.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images (drag to reorder)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => handleImageRemove(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <ImageUpload
            onUploadSuccess={handleImageUpload}
            category={contentType}
          />
        </div>

        {/* Publishing Options */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isPublished" className="text-sm">
              Publish immediately
            </Label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isPublished ? 'This content will be visible to visitors' : 'This content will be saved as a draft'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : (initialContent ? 'Update' : 'Create')} Content
          </Button>
        </div>
      </div>
    </div>
  )
}