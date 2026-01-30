'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { CommentSystem } from '@/components/features/comment-system'
import { useImages } from '@/hooks/useImages'
import { MasonryGallery } from '@/components/ui/masonry-gallery'
import Link from 'next/link'

// Mock daily activities data - this will come from database later
const mockActivities = [
  {
    id: 'morning-routine-jan-20',
    title: 'Perfect Morning Routine',
    date: '2024-01-20',
    time: '7:30 AM',
    mood: 'Energized',
    category: 'Morning',
    description: 'Started the day with my favorite coffee blend and some journaling. There\'s something magical about those quiet morning moments.',
    activities: ['Coffee brewing', 'Journaling', 'Skincare routine', 'Outfit planning'],
    location: 'Home',
    weather: 'Sunny, 45°F',
    highlights: 'Tried a new coffee blend from Blue Bottle - absolutely divine!',
    photos: 3
  },
  {
    id: 'lunch-meeting-jan-19',
    title: 'Business Lunch Success',
    date: '2024-01-19',
    time: '12:00 PM',
    mood: 'Accomplished',
    category: 'Work',
    description: 'Had an amazing lunch meeting that turned into a great partnership opportunity. Sometimes the best business happens over good food.',
    activities: ['Business meeting', 'Networking', 'Strategic planning'],
    location: 'The Modern, NYC',
    weather: 'Cloudy, 38°F',
    highlights: 'Secured a new collaboration that I\'m really excited about!',
    photos: 2
  },
  {
    id: 'evening-walk-jan-18',
    title: 'Golden Hour Stroll',
    date: '2024-01-18',
    time: '5:45 PM',
    mood: 'Peaceful',
    category: 'Leisure',
    description: 'Took advantage of the beautiful golden hour light for a walk through Central Park. These moments of peace are so important.',
    activities: ['Walking', 'Photography', 'People watching', 'Reflection'],
    location: 'Central Park, NYC',
    weather: 'Clear, 42°F',
    highlights: 'Caught the most beautiful sunset over the reservoir.',
    photos: 5
  }
]

const moodColors = {
  'Energized': 'bg-yellow-100 text-yellow-800',
  'Accomplished': 'bg-green-100 text-green-800',
  'Peaceful': 'bg-blue-100 text-blue-800',
  'Happy': 'bg-pink-100 text-pink-800',
  'Reflective': 'bg-purple-100 text-purple-800'
}

const categoryColors = {
  'Morning': 'bg-orange-100 text-orange-800',
  'Work': 'bg-blue-100 text-blue-800',
  'Leisure': 'bg-green-100 text-green-800',
  'Evening': 'bg-purple-100 text-purple-800',
  'Social': 'bg-pink-100 text-pink-800'
}

export default function DailyPage() {
  const { images, loading } = useImages('daily')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', 'Morning', 'Work', 'Leisure', 'Evening', 'Social']
  
  const filteredActivities = selectedCategory === 'all' 
    ? mockActivities 
    : mockActivities.filter(activity => activity.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="My Day" />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What I'm Up To Today
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Daily glimpses into my life, adventures, and the moments that matter most. 
            From morning routines to evening reflections, every day has its story.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              {category === 'all' ? 'All Activities' : category}
            </button>
          ))}
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredActivities.map((activity) => (
            <Link 
              key={activity.id} 
              href={`/daily/${activity.id}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {activity.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  {activity.photos > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>📸</span>
                      <span>{activity.photos}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {activity.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[activity.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}`}>
                    {activity.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${moodColors[activity.mood as keyof typeof moodColors] || 'bg-gray-100 text-gray-800'}`}>
                    {activity.mood}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span>📍</span>
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🌤️</span>
                    <span>{activity.weather}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 italic mb-3">
                    "{activity.highlights}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {activity.activities.slice(0, 2).map((act, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                          {act}
                        </span>
                      ))}
                      {activity.activities.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{activity.activities.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-800 font-medium text-sm">
                      Read More →
                    </div>
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
              Recent Daily Moments
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
            <div className="text-8xl mb-6">✨</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No daily photos yet</h3>
            <p className="text-gray-500 mb-6">Upload some photos from your daily adventures!</p>
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
            <button className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed">
              Add Daily Post (Coming Soon)
            </button>
            <Link 
              href="/admin/images"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition-colors"
            >
              Upload Daily Photos
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto">
          <CommentSystem
            contentId="daily-general"
            contentType="CONTENT_SECTION"
            className="bg-white rounded-2xl shadow-lg p-8"
          />
        </div>
      </main>
    </div>
  )
}