'use client'

import { PhotoShowcase } from '@/components/features/photo-showcase'
import { ContentSection } from '@/components/features/content-section'

export default function PhotoPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ContentSection title="Photo-Centric Design Preview" className="pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Lahra's Life: Photo-First Experience
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This preview shows how photos will become the centerpiece of the website, 
              transforming it from text-based cards to a visual storytelling platform.
            </p>
          </div>
          
          <PhotoShowcase />
          
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Photos Will Be Added</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Upload</h3>
                <p className="text-gray-600 text-sm">
                  Take photos directly from your phone and upload instantly to any category
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🖥️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin Interface</h3>
                <p className="text-gray-600 text-sm">
                  Drag & drop photos in the admin panel with automatic categorization
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Publishing</h3>
                <p className="text-gray-600 text-sm">
                  Photos appear immediately on the website with optimized loading
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  )
}