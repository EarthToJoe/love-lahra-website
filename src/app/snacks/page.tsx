import { ContentSection } from '@/components/features/content-section'
import { SnacksSection } from '@/components/features/snacks-section'
import { PageHeader } from '@/components/layout/page-header'

export default function SnacksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader title="Snacks" />
      
      <ContentSection title="My Snack Adventures" className="pt-8">
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From artisanal treats to guilty pleasures - what I'm munching on lately. 
            Life's too short for boring snacks!
          </p>
        </div>
        <SnacksSection />
      </ContentSection>
    </div>
  )
}