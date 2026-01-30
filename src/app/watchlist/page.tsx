import { ContentSection } from '@/components/features/content-section'
import { MenaWatchlist } from '@/components/features/mena-watchlist'

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ContentSection title="What I'm Watching" className="pt-8">
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Entertainment recommendations and what's currently on my screen. 
            From political dramas to guilty pleasure reality shows, here's my viewing diary.
          </p>
        </div>
        <MenaWatchlist />
      </ContentSection>
    </div>
  )
}