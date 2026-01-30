import { ContentSection } from '@/components/features/content-section'
import { FunFacts } from '@/components/features/fun-facts'
import { PageHeader } from '@/components/layout/page-header'

export default function FunFactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="Fun Facts" />
      
      <ContentSection title="Fun Facts About Me" className="pt-8">
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quirky insights, random discoveries, and little-known facts about my life. 
            Get to know the real me beyond the sophisticated exterior!
          </p>
        </div>
        <FunFacts />
      </ContentSection>
    </div>
  )
}