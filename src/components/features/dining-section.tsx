'use client'

interface DiningSectionProps {
  restaurants?: Array<{
    id: string
    name: string
    cuisine: string
    description: string
    rating: number
    priceRange: string
    location: string
    date: string
  }>
}

export function DiningSection({ restaurants = [] }: DiningSectionProps) {
  // Mock data for demonstration
  const mockRestaurants = [
    {
      id: '1',
      name: 'Le Bernardin',
      cuisine: 'French Seafood',
      description: 'Exquisite seafood in an elegant Manhattan setting. The tasting menu was absolutely divine.',
      rating: 5,
      priceRange: '$$$$',
      location: 'New York, NY',
      date: '2024-01-26'
    },
    {
      id: '2',
      name: 'The Wharf Oyster Bar',
      cuisine: 'Coastal American',
      description: 'Fresh oysters with a stunning harbor view. Perfect for a sophisticated lunch.',
      rating: 4,
      priceRange: '$$$',
      location: 'Boston, MA', 
      date: '2024-01-24'
    },
    {
      id: '3',
      name: 'Fiola Mare',
      cuisine: 'Italian Seafood',
      description: 'Waterfront dining with impeccable Italian seafood. The ambiance is unmatched.',
      rating: 5,
      priceRange: '$$$$',
      location: 'Washington, DC',
      date: '2024-01-22'
    }
  ]

  const displayRestaurants = restaurants.length > 0 ? restaurants : mockRestaurants

  return (
    <div className="space-y-6">
      {displayRestaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{restaurant.name}</h3>
              <p className="text-blue-600 font-medium">{restaurant.cuisine} • {restaurant.location}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < restaurant.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">{restaurant.priceRange}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{restaurant.description}</p>
          <p className="text-sm text-gray-500">Visited {new Date(restaurant.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}