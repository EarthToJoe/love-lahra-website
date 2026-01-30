'use client'

interface MenaWatchlistProps {
  shows?: Array<{
    id: string
    title: string
    type: 'Movie' | 'TV Show' | 'Documentary'
    genre: string
    description: string
    rating: number
    status: 'Watching' | 'Completed' | 'Want to Watch'
    date: string
  }>
}

export function MenaWatchlist({ shows = [] }: MenaWatchlistProps) {
  // Mock data for demonstration
  const mockShows = [
    {
      id: '1',
      title: 'The Crown',
      type: 'TV Show' as const,
      genre: 'Historical Drama',
      description: 'Absolutely captivated by the royal family dynamics. The costume design is impeccable.',
      rating: 5,
      status: 'Completed' as const,
      date: '2024-01-26'
    },
    {
      id: '2',
      title: 'Emily in Paris',
      type: 'TV Show' as const,
      genre: 'Romance/Comedy',
      description: 'Guilty pleasure alert! The fashion inspiration alone makes it worth watching.',
      rating: 4,
      status: 'Watching' as const,
      date: '2024-01-25'
    },
    {
      id: '3',
      title: 'Somm',
      type: 'Documentary' as const,
      genre: 'Food & Wine',
      description: 'Fascinating look into the world of master sommeliers. Made me appreciate wine even more.',
      rating: 5,
      status: 'Completed' as const,
      date: '2024-01-24'
    },
    {
      id: '4',
      title: 'House of Cards',
      type: 'TV Show' as const,
      genre: 'Political Drama',
      description: 'Living in DC makes this show hit differently. The political intrigue is addictive.',
      rating: 4,
      status: 'Want to Watch' as const,
      date: '2024-01-23'
    }
  ]

  const displayShows = shows.length > 0 ? shows : mockShows

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Watching': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Want to Watch': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {displayShows.map((show) => (
        <div key={show.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{show.title}</h3>
              <p className="text-gray-600">{show.type} • {show.genre}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < show.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(show.status)}`}>
                {show.status}
              </span>
            </div>
          </div>
          <p className="text-gray-700 mb-3">{show.description}</p>
          <p className="text-sm text-gray-500">Added {new Date(show.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}