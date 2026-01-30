'use client'

interface SnacksSectionProps {
  snacks?: Array<{
    id: string
    name: string
    category: string
    description: string
    rating: number
    where: string
    date: string
  }>
}

export function SnacksSection({ snacks = [] }: SnacksSectionProps) {
  // Mock data for demonstration
  const mockSnacks = [
    {
      id: '1',
      name: 'Artisanal Macarons',
      category: 'Sweet',
      description: 'Delicate French macarons from Ladurée. The rose flavor was absolutely perfect.',
      rating: 5,
      where: 'Ladurée, NYC',
      date: '2024-01-26'
    },
    {
      id: '2',
      name: 'Truffle Popcorn',
      category: 'Savory',
      description: 'Gourmet popcorn with real truffle oil. A guilty pleasure that\'s worth every bite.',
      rating: 4,
      where: 'Local Gourmet Shop',
      date: '2024-01-25'
    },
    {
      id: '3',
      name: 'Dark Chocolate Sea Salt Caramels',
      category: 'Sweet',
      description: 'Handcrafted caramels with the perfect balance of sweet and salty.',
      rating: 5,
      where: 'Vosges Chocolate',
      date: '2024-01-23'
    }
  ]

  const displaySnacks = snacks.length > 0 ? snacks : mockSnacks

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displaySnacks.map((snack) => (
        <div key={snack.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{snack.name}</h3>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full mt-1">
                {snack.category}
              </span>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < snack.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-600 mb-3">{snack.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{snack.where}</span>
            <span>{new Date(snack.date).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}