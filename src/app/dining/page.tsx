'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { ContentSection } from '@/components/features/content-section'
import { CommentSystem } from '@/components/features/comment-system'
import { useImages } from '@/hooks/useImages'
import { MasonryGallery } from '@/components/ui/masonry-gallery'
import Link from 'next/link'

// Mock restaurant data - this will come from database later
const mockRestaurants = [
  {
    id: 'le-bernardin',
    name: 'Le Bernardin',
    cuisine: 'French Seafood',
    location: 'Midtown Manhattan, NYC',
    priceRange: '$$$$',
    rating: 5,
    description: 'Exquisite French seafood in an elegant setting. The tasting menu was absolutely divine.',
    visitDate: '2024-01-15',
    occasion: 'Special Celebration',
    highlights: ['Lobster Thermidor', 'Sea Urchin', 'Chocolate Soufflé'],
    wouldReturn: true
  },
  {
    id: 'blue-hill',
    name: 'Blue Hill',
    cuisine: 'Farm-to-Table',
    location: 'Greenwich Village, NYC',
    priceRange: '$$$',
    rating: 4,
    description: 'Innovative farm-to-table dining with ingredients sourced from their own farm.',
    visitDate: '2024-01-10',
    occasion: 'Date Night',
    highlights: ['Seasonal Vegetables', 'Heritage Pork', 'Farm Cheese'],
    wouldReturn: true
  },
  {
    id: 'katz-deli',
    name: "Katz's Delicatessen",
    cuisine: 'Jewish Deli',
    location: 'Lower East Side, NYC',
    priceRange: '$$',
    rating: 4,
    description: 'Iconic NYC deli with the best pastrami sandwich. A must-visit classic.',
    visitDate: '2024-01-08',
    occasion: 'Casual Dining',
    highlights: ['Pastrami on Rye', 'Pickles', 'Matzo Ball Soup'],
    wouldReturn: true
  }
]

export default function DiningPage() {
  const { images, loading } = useImages('dining')
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="Dining" />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Where I'm Dining
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Restaurant discoveries, culinary adventures, and my favorite food experiences. 
            From Michelin stars to hidden gems, every meal tells a story.
          </p>
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mockRestaurants.map((restaurant) => (
            <Link 
              key={restaurant.id} 
              href={`/dining/${restaurant.id}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600">{restaurant.cuisine}</p>
                    <p className="text-sm text-gray-500">{restaurant.location}</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < restaurant.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({restaurant.rating}/5)</span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {restaurant.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{restaurant.occasion}</span>
                  <span>{new Date(restaurant.visitDate).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {restaurant.highlights.slice(0, 2).map((highlight, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                  {restaurant.highlights.length > 2 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{restaurant.highlights.length - 2} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    {restaurant.wouldReturn && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        ✓ Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-blue-600 group-hover:text-blue-800 font-medium text-sm">
                    Read More →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Photo Gallery */}
        {images.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Recent Dining Photos
            </h2>
            <MasonryGallery
              images={images.map(img => ({
                ...img,
                aspectRatio: Math.random() * 0.5 + 0.7
              }))}
              columns={3}
              gap={20}
              onImageClick={(image) => console.log('Image clicked:', image)}
            />
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No dining photos yet</h3>
            <p className="text-gray-500 mb-6">Upload some food and restaurant photos to showcase your culinary adventures!</p>
            <Link 
              href="/admin/images" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Photos
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="text-center mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/admin/dining"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Restaurant Review
            </Link>
            <Link 
              href="/admin/images"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition-colors"
            >
              Upload Food Photos
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto">
          <CommentSystem
            contentId="dining-general"
            contentType="CONTENT_SECTION"
            className="bg-white rounded-2xl shadow-lg p-8"
          />
        </div>
      </main>
    </div>
  )
}