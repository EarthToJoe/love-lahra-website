'use client'

import { useState, useEffect } from 'react'
import { ContentSection } from '@/types'
import { ContentEditor } from './content-editor'
import { Button } from '@/components/ui/button'

interface ContentManagerProps {
  contentType: 'daily-activity' | 'closet' | 'outfit' | 'dining' | 'snacks' | 'fun-facts' | 'mena-watchlist'
}

export function ContentManager({ contentType }: ContentManagerProps) {
  const [contents, setContents] = useState<ContentSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingContent, setEditingContent] = useState<ContentSection | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Mock data for development - replace with API calls
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true)
      try {
        // Mock content data
        const mockContent: ContentSection[] = [
          {
            id: `${contentType}-1`,
            type: contentType,
            title: `Sample ${contentType.replace('-', ' ')} content`,
            content: `This is sample content for ${contentType}. In a real application, this would be loaded from your database.`,
            images: [],
            metadata: getDefaultMetadata(contentType),
            isPublished: true,
            publishedAt: new Date(),
            createdAt: new Date(Date.now() - 86400000), // Yesterday
            updatedAt: new Date(),
          },
          {
            id: `${contentType}-2`,
            type: contentType,
            title: `Draft ${contentType.replace('-', ' ')} content`,
            content: `This is a draft content for ${contentType}. It's not published yet.`,
            images: [],
            metadata: getDefaultMetadata(contentType),
            isPublished: false,
            createdAt: new Date(Date.now() - 172800000), // 2 days ago
            updatedAt: new Date(Date.now() - 86400000), // Yesterday
          },
        ]
        setContents(mockContent)
      } catch (error) {
        console.error('Error loading content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [contentType])

  const getDefaultMetadata = (type: string) => {
    switch (type) {
      case 'dining':
        return { restaurant: '', cuisine: '', location: '', rating: 5 }
      case 'outfit':
        return { occasion: '', season: '', style: '' }
      case 'daily-activity':
        return { date: new Date().toISOString().split('T')[0], location: '', mood: '' }
      default:
        return {}
    }
  }

  const handleSaveContent = async (content: ContentSection) => {
    try {
      // In a real app, this would make an API call
      if (editingContent) {
        // Update existing content
        setContents(prev => prev.map(c => c.id === content.id ? content : c))
      } else {
        // Add new content
        setContents(prev => [...prev, content])
      }
      
      setShowEditor(false)
      setEditingContent(null)
    } catch (error) {
      console.error('Error saving content:', error)
      throw error
    }
  }

  const handleEditContent = (content: ContentSection) => {
    setEditingContent(content)
    setShowEditor(true)
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    
    try {
      // In a real app, this would make an API call
      setContents(prev => prev.filter(c => c.id !== contentId))
    } catch (error) {
      console.error('Error deleting content:', error)
      alert('Error deleting content. Please try again.')
    }
  }

  const handleTogglePublish = async (content: ContentSection) => {
    try {
      const updatedContent = {
        ...content,
        isPublished: !content.isPublished,
        publishedAt: !content.isPublished ? new Date() : undefined,
        updatedAt: new Date(),
      }
      
      setContents(prev => prev.map(c => c.id === content.id ? updatedContent : c))
    } catch (error) {
      console.error('Error updating content:', error)
      alert('Error updating content. Please try again.')
    }
  }

  const filteredContents = contents.filter(content => {
    if (filter === 'published') return content.isPublished
    if (filter === 'draft') return !content.isPublished
    return true
  })

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'daily-activity': return '✨'
      case 'outfit': return '👗'
      case 'dining': return '🍽️'
      case 'snacks': return '🍿'
      case 'fun-facts': return '🤓'
      case 'mena-watchlist': return '🎬'
      default: return '📝'
    }
  }

  if (showEditor) {
    return (
      <ContentEditor
        contentType={contentType}
        initialContent={editingContent || undefined}
        onSave={handleSaveContent}
        onCancel={() => {
          setShowEditor(false)
          setEditingContent(null)
        }}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              {getContentTypeIcon(contentType)}
              <span className="ml-2">
                {contentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Content
              </span>
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your {contentType.replace('-', ' ')} content, create new posts, and organize your content.
            </p>
          </div>
          <Button
            onClick={() => setShowEditor(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Create New
          </Button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({contents.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'published'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Published ({contents.filter(c => c.isPublished).length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Drafts ({contents.filter(c => !c.isPublished).length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      )}

      {/* Content List */}
      {!loading && (
        <div className="space-y-4">
          {filteredContents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">{getContentTypeIcon(contentType)}</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter === 'all' ? '' : filter} content yet
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? `Create your first ${contentType.replace('-', ' ')} post to get started.`
                  : `No ${filter} content found. Try changing the filter or create new content.`
                }
              </p>
              <Button
                onClick={() => setShowEditor(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create New Content
              </Button>
            </div>
          ) : (
            filteredContents.map((content) => (
              <div key={content.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        content.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {content.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{content.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Created: {content.createdAt.toLocaleDateString()}
                      </span>
                      <span>
                        Updated: {content.updatedAt.toLocaleDateString()}
                      </span>
                      {content.images.length > 0 && (
                        <span className="flex items-center">
                          📸 {content.images.length} image{content.images.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(content)}
                    >
                      {content.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditContent(content)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContent(content.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}