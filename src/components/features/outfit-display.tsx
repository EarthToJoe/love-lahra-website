'use client'

import Image from 'next/image'

interface OutfitDisplayProps {
  outfits?: Array<{
    id: string
    title: string
    description: string
    imageUrl?: string
    tags: string[]
    date: string
  }>
}

export function OutfitDisplay({ outfits = [] }: OutfitDisplayProps) {
  // Mock data for demonstration
  const mockOutfits = [
    {
      id: '1',
      title: 'Power Meeting Look',
      description: 'Navy blazer with champagne gold accessories for that DC confidence',
      imageUrl: '/uploads/outfits/placeholder-outfit-1.jpg',
      tags: ['Professional', 'Navy', 'Gold'],
      date: '2024-01-26'
    },
    {
      id: '2', 
      title: 'Coastal Dinner Elegance',
      description: 'Flowing white dress perfect for seaside dining',
      imageUrl: '/uploads/outfits/placeholder-outfit-2.jpg',
      tags: ['Elegant', 'White', 'Coastal'],
      date: '2024-01-25'
    },
    {
      id: '3',
      title: 'Black Tie Sophistication', 
      description: 'Classic black with statement jewelry for formal events',
      imageUrl: '/uploads/outfits/placeholder-outfit-3.jpg',
      tags: ['Formal', 'Black', 'Statement'],
      date: '2024-01-24'
    }
  ]

  const displayOutfits = outfits.length > 0 ? outfits : mockOutfits

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayOutfits.map((outfit) => (
        <div key={outfit.id} className="group relative">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="aspect-[3/4] relative bg-gradient-to-br from-gray-100 to-gray-200">
              {outfit.imageUrl ? (
                <Image
                  src={outfit.imageUrl}
                  alt={outfit.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">👗</div>
                    <p className="text-sm">Outfit Photo</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{outfit.title}</h3>
              <p className="text-gray-600 mb-4">{outfit.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {outfit.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">{new Date(outfit.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}