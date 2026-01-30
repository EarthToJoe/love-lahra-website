'use client'

import { useState } from 'react'
import { ContentSection } from '@/components/features/content-section'
import { ImageUpload } from '@/components/ui/image-upload'

export default function DiningAdminPage() {
  const [activeTab, setActiveTab] = useState('create')
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    cuisine: '',
    location: '',
    priceRange: '$',
    rating: 5,
    visitDate: '',
    occasion: '',
    review: '',
    highlights: '',
    wouldReturn: true
  })

  const tabs = [
    { id: 'create', label: 'Add Restaurant', icon: '🍽️' },
    { id: 'manage', label: 'Manage Posts', icon: '📝' },
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
    { id: 'wishlist', label: 'Wishlist', icon: '📋' }
  ]

  const cuisineTypes = [
    'Italian', 'French', 'American', 'Asian', 'Mexican', 'Mediterranean', 
    'Japanese', 'Thai', 'Indian', 'Seafood', 'Steakhouse', 'Brunch', 'Other'
  ]

  const occasions = [
    'Date Night', 'Business Meeting', 'Girls Night', 'Family Dinner', 
    'Special Celebration', 'Casual Dining', 'Solo Dining', 'Group Event'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ContentSection title="Dining Management" className="pt-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Restaurant & Dining Management
            </h1>
            <p className="text-lg text-gray-600">
              Document your culinary adventures, restaurant reviews, and dining experiences
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Based on Active Tab */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Restaurant Experience</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Restaurant Details Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Le Bernardin"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine Type
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={restaurantForm.cuisine}
                        onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
                      >
                        <option value="">Select cuisine</option>
                        {cuisineTypes.map(cuisine => (
                          <option key={cuisine} value={cuisine}>{cuisine}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={restaurantForm.priceRange}
                        onChange={(e) => setRestaurantForm({...restaurantForm, priceRange: e.target.value})}
                      >
                        <option value="$">$ - Budget Friendly</option>
                        <option value="$$">$$ - Moderate</option>
                        <option value="$$$">$$$ - Upscale</option>
                        <option value="$$$$">$$$$ - Fine Dining</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Midtown Manhattan, NYC"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={restaurantForm.location}
                      onChange={(e) => setRestaurantForm({...restaurantForm, location: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visit Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={restaurantForm.visitDate}
                        onChange={(e) => setRestaurantForm({...restaurantForm, visitDate: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occasion
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={restaurantForm.occasion}
                        onChange={(e) => setRestaurantForm({...restaurantForm, occasion: e.target.value})}
                      >
                        <option value="">Select occasion</option>
                        {occasions.map(occasion => (
                          <option key={occasion} value={occasion}>{occasion}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRestaurantForm({...restaurantForm, rating: star})}
                          className={`text-2xl ${
                            star <= restaurantForm.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="ml-2 text-gray-600">({restaurantForm.rating}/5)</span>
                    </div>
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>
                    <ImageUpload
                      category="dining"
                      onUploadSuccess={(fileInfo) => console.log('Photo uploaded:', fileInfo)}
                      onUploadError={(error) => console.error('Upload error:', error)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Highlights
                    </label>
                    <textarea
                      rows={4}
                      placeholder="What dishes did you try? What would you recommend?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={restaurantForm.highlights}
                      onChange={(e) => setRestaurantForm({...restaurantForm, highlights: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={restaurantForm.wouldReturn}
                        onChange={(e) => setRestaurantForm({...restaurantForm, wouldReturn: e.target.checked})}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Would return / Recommend to others
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  rows={6}
                  placeholder="Share your experience... What was the atmosphere like? How was the service? What made this meal special?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={restaurantForm.review}
                  onChange={(e) => setRestaurantForm({...restaurantForm, review: e.target.value})}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button 
                  onClick={() => {
                    console.log('Saving draft:', restaurantForm)
                    alert('Draft saved! (This will be implemented in a future task)')
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button 
                  onClick={async () => {
                    if (!restaurantForm.name) {
                      alert('Please enter a restaurant name')
                      return
                    }
                    
                    try {
                      // Create content section for dining
                      const response = await fetch('/api/content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'DINING',
                          title: restaurantForm.name,
                          content: JSON.stringify({
                            cuisine: restaurantForm.cuisine,
                            location: restaurantForm.location,
                            priceRange: restaurantForm.priceRange,
                            rating: restaurantForm.rating,
                            visitDate: restaurantForm.visitDate,
                            occasion: restaurantForm.occasion,
                            review: restaurantForm.review,
                            highlights: restaurantForm.highlights,
                            wouldReturn: restaurantForm.wouldReturn
                          }),
                          isPublished: true,
                          publishedAt: new Date().toISOString()
                        })
                      })
                      
                      if (response.ok) {
                        alert('Restaurant post published successfully!')
                        // Reset form
                        setRestaurantForm({
                          name: '',
                          cuisine: '',
                          location: '',
                          priceRange: '$',
                          rating: 5,
                          visitDate: '',
                          occasion: '',
                          review: '',
                          highlights: '',
                          wouldReturn: true
                        })
                      } else {
                        const error = await response.json()
                        alert(`Error: ${error.message || 'Failed to publish post'}`)
                      }
                    } catch (error) {
                      console.error('Error publishing post:', error)
                      alert('Failed to publish post. Please try again.')
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publish Post
                </button>
              </div>
            </div>
          )}

          {/* Other tabs content (placeholder) */}
          {activeTab !== 'create' && (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500">
                This section will display your published dining posts. Add some posts using the "Add Restaurant" tab to see them here!
              </p>
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  )
}