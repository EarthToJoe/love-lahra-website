'use client'

interface FunFactsProps {
  facts?: Array<{
    id: string
    fact: string
    category: string
    date: string
  }>
}

export function FunFacts({ facts = [] }: FunFactsProps) {
  // Mock data for demonstration
  const mockFacts = [
    {
      id: '1',
      fact: 'I can identify a wine\'s region just by smell - a skill I picked up during my sommelier course in Napa.',
      category: 'Wine & Dining',
      date: '2024-01-26'
    },
    {
      id: '2',
      fact: 'My closet is organized by color gradient, and I have exactly 47 pairs of shoes (yes, I counted).',
      category: 'Fashion',
      date: '2024-01-25'
    },
    {
      id: '3',
      fact: 'I once had dinner at the same restaurant as three different senators in one week - DC is smaller than you think!',
      category: 'DC Life',
      date: '2024-01-24'
    },
    {
      id: '4',
      fact: 'I collect vintage champagne flutes and have over 20 unique sets from different decades.',
      category: 'Collections',
      date: '2024-01-23'
    }
  ]

  const displayFacts = facts.length > 0 ? facts : mockFacts

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayFacts.map((fact) => (
        <div key={fact.id} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <p className="text-gray-800 mb-3 leading-relaxed">{fact.fact}</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-pink-200 text-pink-800 text-sm rounded-full">
                  {fact.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(fact.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}