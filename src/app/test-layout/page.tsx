import MainLayout from '@/components/layout/main-layout'

export default function TestLayoutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-4">Layout Test Page</h1>
          <p className="text-neutral-600">This page tests if the layout is properly centered</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-elegant">
            <h3 className="font-semibold mb-2">Left Column</h3>
            <p className="text-neutral-600">This should be properly aligned</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-elegant">
            <h3 className="font-semibold mb-2">Center Column</h3>
            <p className="text-neutral-600">This should be centered</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-elegant">
            <h3 className="font-semibold mb-2">Right Column</h3>
            <p className="text-neutral-600">This should be properly aligned</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-block bg-accent-500 text-white px-8 py-3 rounded-lg">
            This button should be centered
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-neutral-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Container class: "container mx-auto px-6 py-16"</li>
            <li>• Should be centered with proper padding</li>
            <li>• Max width should be responsive</li>
            <li>• Content should not be squished to the left</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}