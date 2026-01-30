'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { useImages } from '@/hooks/useImages'
import { ImageGallery } from '@/components/ui/image-gallery'
import Link from 'next/link'

// Mock restaurant data - this will come from database later
const mockRestaurants = {
  'le-bernardin': {
    id: 'le-bernardin',
    name: 'Le Bernardin',
    cuisine: 'French Seafood',
    location: 'Midtown Manhattan, NYC',
    address: '155 West 51st Street, New York, NY 10019',
    priceRange: '$$$$',
    rating: 5,
    description: 'Exquisite French seafood in an elegant setting. The tasting menu was absolutely divine.',
    fullReview: `Le Bernardin continues to set the standard for fine dining in New York City. From the moment you step into the serene, ocean-inspired dining room, you know you're in for something special.

The tasting menu was a journey through the finest seafood preparations I've ever experienced. Each dish was a masterpiece of technique and flavor, showcasing the natural beauty of the ingredients while elevating them to new heights.

The service was impeccable - attentive without being intrusive, knowledgeable about every detail of the preparation and wine pairings. The sommelier's recommendations were spot-on and enhanced each course perfectly.

This is the kind of meal that reminds you why fine dining exists - it's not just about the food, but the entire experience of being transported to another world for a few hours.`,
    visitDate: '2024-01-15',
    occasion: 'Special Celebration',
    highlights: ['Lobster Thermidor', 'Sea Urchin', 'Chocolate Soufflé', 'Wine Pairings', 'Impeccable Service'],
    wouldReturn: true,
    reservationTips: 'Book well in advance. Dress code is business casual to formal.',
    priceNote: 'Tasting menu around $200-300 per person, wine pairings additional.'
  },
  'blue-hill': {
    id: 'blue-hill',
    name: 'Blue Hill',
    cuisine: 'Farm-to-Table',
    location: 'Greenwich Village, NYC',
    address: '75 Washington Place, New York, NY 10011',
    priceRange: '$$$',
    rating: 4,
    description: 'Innovative farm-to-table dining with ingredients sourced from their own farm.',
    fullReview: `Blue Hill represents everything I love about the farm-to-table movement. The menu changes based on what's available from their farm, which means every visit is a unique experience.

The creativity in how they use every part of the ingredient is remarkable. Nothing goes to waste, and you can taste the difference that fresh, sustainably-grown produce makes.

The atmosphere is cozy and intimate, perfect for a date night or special dinner with friends. The staff is passionate about the restaurant's mission and can tell you exactly where each ingredient came from.

While not every dish was a home run, the overall experience was memorable and I appreciated the restaurant's commitment to sustainability and supporting local agriculture.`,
    visitDate: '2024-01-10',
    occasion: 'Date Night',
    highlights: ['Seasonal Vegetables', 'Heritage Pork', 'Farm Cheese', 'Sustainable Practices', 'Creative Preparations'],
    wouldReturn: true,
    reservationTips: 'Reservations recommended. Menu changes frequently based on seasonal availability.',
    priceNote: 'Prix fixe menu around $100-150 per person.'
  },
  'katz-deli': {
    id: 'katz-deli',
    name: "Katz's Delicatessen",
    cuisine: 'Jewish Deli',
    location: 'Lower East Side, NYC',
    address: '205 East Houston Street, New York, NY 10002',
    priceRange: '$$',
    rating: 4,
    description: 'Iconic NYC deli with the best pastrami sandwich. A must-visit classic.',
    fullReview: `Katz's Deli is a New York institution, and for good reason. This place has been serving up incredible pastrami sandwiches since 1888, and they've perfected their craft.

The pastrami sandwich is legendary - thick slices of perfectly seasoned, tender pastrami piled high on rye bread. It's messy, it's huge, and it's absolutely delicious. The pickles that come with it are the perfect tangy complement.

The atmosphere is pure old-school New York - bustling, loud, and full of character. The ordering system with tickets is part of the experience, and the staff behind the counter are characters themselves.

It's not fancy, but it doesn't need to be. Sometimes the best food comes from places that have been doing the same thing perfectly for over a century.`,
    visitDate: '2024-01-08',
    occasion: 'Casual Dining',
    highlights: ['Pastrami on Rye', 'Pickles', 'Matzo Ball Soup', 'Historic Atmosphere', 'NYC Institution'],
    wouldReturn: true,
    reservationTips: 'No reservations needed. Expect a wait during peak hours. Cash preferred.',
    priceNote: 'Sandwiches around $20-30. Very generous portions.'
  }
}

export default function RestaurantPage() {
  const params = useParams()
  const slug = params.slug as string
  const restaurant = mockRestaurants[slug as keyof typeof mockRestaurants]
  const { images } = useImages('dining')

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PageHeader title="Restaurant Not Found" backHref="/dining" backLabel="Dining" />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="text-8xl mb-6">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-8">The restaurant you're looking for doesn't exist.</p>
          <Link 
            href="/dining"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dining
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title={restaurant.name} backHref="/dining" backLabel="Dining" />
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              <p className="text-xl text-gray-600 mb-2">{restaurant.cuisine}</p>
              <p className="text-gray-500">{restaurant.address}</p>
            </div>
            
            <div className="flex flex-col items-start md:items-end space-y-2">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-xl ${i < restaurant.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
                <span className="ml-2 text-gray-600">({restaurant.rating}/5)</span>
              </div>
              <div className="text-sm text-gray-500">
                Visited: {new Date(restaurant.visitDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {restaurant.occasion}
            </span>
            {restaurant.wouldReturn && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                ✓ Recommended
              </span>
            )}
          </div>

          <p className="text-gray-700 text-lg leading-relaxed">{restaurant.description}</p>
        </div>

        {/* Full Review */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Experience</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            {restaurant.fullReview.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Info */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Good to Know</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reservations & Tips</h3>
              <p className="text-gray-700">{restaurant.reservationTips}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
              <p className="text-gray-700">{restaurant.priceNote}</p>
            </div>
          </div>
        </div>

        {/* Photos */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>
            <ImageGallery 
              images={images.slice(0, 6)}
              columns={3}
              showLightbox={true}
            />
          </div>
        )}

        {/* Actions */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dining"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to All Restaurants
            </Link>
            <Link 
              href="/admin/dining"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add Your Own Review
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}