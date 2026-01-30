'use client'

import { DonationWidget } from '@/components/features/donation-widget'
import { DonorRecognition } from '@/components/features/donor-recognition'
import { DonationGoals } from '@/components/features/donation-goals'
import { ContentSection } from '@/components/features/content-section'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      <ContentSection title="Support Lahra's Life" className="pt-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              💝 Support This Digital Diary
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your support helps keep this personal space alive and growing. Every donation, 
              no matter the size, contributes to better content, improved features, and the 
              ongoing maintenance of this digital diary.
            </p>
          </div>

          {/* Main Donation Widget */}
          <div className="mb-12">
            <DonationWidget />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Donation Goals */}
            <DonationGoals />
            
            {/* Donor Recognition */}
            <DonorRecognition />
          </div>

          {/* Why Support Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Your Support Matters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  🌐
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep It Running</h3>
                <p className="text-gray-600 text-sm">
                  Hosting, domain, and technical maintenance costs to keep the site accessible 24/7
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  ✨
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Content</h3>
                <p className="text-gray-600 text-sm">
                  Investment in better photography equipment, tools, and resources for higher quality content
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  🚀
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">New Features</h3>
                <p className="text-gray-600 text-sm">
                  Development of new interactive features, improvements, and enhanced user experiences
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is my donation secure?
                </h3>
                <p className="text-gray-600">
                  Yes! All donations are processed securely through Stripe, a trusted payment processor 
                  used by millions of businesses worldwide. Your payment information is encrypted and never stored on our servers.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I donate anonymously?
                </h3>
                <p className="text-gray-600">
                  Absolutely! You can choose to make your donation anonymous during the checkout process. 
                  Anonymous donations will still be counted toward our goals but won't display your name publicly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Will I receive a receipt?
                </h3>
                <p className="text-gray-600">
                  Yes, you'll receive an email receipt immediately after your donation is processed. 
                  This receipt can be used for your records.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How will my donation be used?
                </h3>
                <p className="text-gray-600">
                  Donations go toward website hosting, domain costs, content creation tools, 
                  photography equipment, and ongoing development of new features to enhance your experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  )
}