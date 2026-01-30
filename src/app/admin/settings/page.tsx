'use client'

import { useState } from 'react'
import { ContentSection } from '@/components/features/content-section'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { getCurrentEmojiConfig, updateEmojiConfig, emojiPresets, isValidEmoji, EmojiConfig } from '@/lib/emojis'

export default function AdminSettings() {
  const { theme, availableThemes, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'themes' | 'emojis' | 'general' | 'advanced'>('themes')
  const [emojiConfig, setEmojiConfig] = useState<EmojiConfig>(getCurrentEmojiConfig())
  const [newEmoji, setNewEmoji] = useState('')

  const handleEmojiConfigUpdate = (updates: Partial<EmojiConfig>) => {
    const newConfig = { ...emojiConfig, ...updates }
    setEmojiConfig(newConfig)
    updateEmojiConfig(updates)
  }

  const addBackHomeEmoji = () => {
    if (newEmoji && isValidEmoji(newEmoji) && !emojiConfig.backHomeEmojis.includes(newEmoji)) {
      const updatedEmojis = [...emojiConfig.backHomeEmojis, newEmoji]
      handleEmojiConfigUpdate({ backHomeEmojis: updatedEmojis })
      setNewEmoji('')
    }
  }

  const removeBackHomeEmoji = (emoji: string) => {
    const updatedEmojis = emojiConfig.backHomeEmojis.filter(e => e !== emoji)
    handleEmojiConfigUpdate({ backHomeEmojis: updatedEmojis })
  }

  const applyEmojiPreset = (presetName: keyof typeof emojiPresets) => {
    handleEmojiConfigUpdate({ backHomeEmojis: emojiPresets[presetName] })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ContentSection title="Website Settings" className="pt-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">⚙️ Website Settings</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Customize your website's appearance, themes, and functionality
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-lg mx-auto">
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'themes'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎨 Themes
            </button>
            <button
              onClick={() => setActiveTab('emojis')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'emojis'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              😊 Emojis
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ General
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔧 Advanced
            </button>
          </div>

          {/* Themes Tab */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Theme</h2>
                <p className="text-gray-600 mb-6">
                  Select a theme that matches your current vibe. Each theme changes colors, typography, and overall aesthetic.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availableThemes.map((availableTheme) => (
                    <div
                      key={availableTheme.name}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        theme.name === availableTheme.name
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => setTheme(availableTheme)}
                    >
                      {theme.name === availableTheme.name && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {availableTheme.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {availableTheme.description}
                        </p>
                      </div>
                      
                      {/* Color Preview */}
                      <div className="flex space-x-2 mb-4">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: availableTheme.colors.primary[500] }}
                          title="Primary Color"
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: availableTheme.colors.accent[500] }}
                          title="Accent Color"
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: availableTheme.colors.neutral[100] }}
                          title="Background Color"
                        />
                      </div>
                      
                      <Button
                        variant={theme.name === availableTheme.name ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTheme(availableTheme)
                        }}
                      >
                        {theme.name === availableTheme.name ? 'Current Theme' : 'Apply Theme'}
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-accent-50 rounded-lg border border-accent-200">
                  <h4 className="font-medium text-accent-800 mb-2">
                    🎨 Easy Theme Customization
                  </h4>
                  <p className="text-sm text-accent-700">
                    Themes are designed to be easily customizable. The sophisticated navy & champagne gold theme 
                    reflects your original vision of "New York, classy, fun, New England, US Senate, fashion, wedding, DC, fancy restaurant foodie, coastal, black tie, unapologetic" aesthetic.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emojis Tab */}
          {activeTab === 'emojis' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customize Your Emojis</h2>
                <p className="text-gray-600 mb-6">
                  Personalize the emojis that appear throughout your website. Make it uniquely you!
                </p>
                
                {/* Back Home Button Emojis */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Back Home Button Emojis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These emojis randomly appear in your "Back Home" buttons throughout the site.
                  </p>
                  
                  {/* Current Emojis */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Emojis ({emojiConfig.backHomeEmojis.length})
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[60px]">
                      {emojiConfig.backHomeEmojis.map((emoji, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-white px-3 py-2 rounded-lg border shadow-sm group hover:shadow-md transition-shadow"
                        >
                          <span className="text-xl mr-2">{emoji}</span>
                          <button
                            onClick={() => removeBackHomeEmoji(emoji)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove emoji"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Add New Emoji */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      placeholder="Add new emoji (e.g., 😊)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      maxLength={4}
                    />
                    <Button onClick={addBackHomeEmoji} disabled={!newEmoji || !isValidEmoji(newEmoji)}>
                      Add Emoji
                    </Button>
                  </div>
                  
                  {/* Emoji Presets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(emojiPresets).map(([presetName, emojis]) => (
                        <button
                          key={presetName}
                          onClick={() => applyEmojiPreset(presetName as keyof typeof emojiPresets)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                        >
                          <div className="font-medium text-gray-900 capitalize mb-1">{presetName}</div>
                          <div className="text-sm text-gray-600 mb-2">
                            {emojis.slice(0, 6).join(' ')}
                            {emojis.length > 6 && '...'}
                          </div>
                          <div className="text-xs text-gray-500">{emojis.length} emojis</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Hero Emoji */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section Emoji</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    The emoji that appears in your main title "Hey, it's Lahra [emoji]"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                      <span className="text-2xl mr-3">{emojiConfig.heroEmoji}</span>
                      <span className="text-gray-700">Current: "Hey, it's Lahra {emojiConfig.heroEmoji}"</span>
                    </div>
                    <input
                      type="text"
                      value={emojiConfig.heroEmoji}
                      onChange={(e) => {
                        if (isValidEmoji(e.target.value) || e.target.value === '') {
                          handleEmojiConfigUpdate({ heroEmoji: e.target.value })
                        }
                      }}
                      placeholder="💁‍♀️"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-xl"
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-medium text-primary-800 mb-2">
                    ✨ Pro Tip
                  </h4>
                  <p className="text-sm text-primary-700">
                    Emojis update throughout your site immediately! The "Back Home" button changes every 30 seconds 
                    or when clicked for a fun surprise. Perfect for when your mood changes!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website Title
                    </label>
                    <input
                      type="text"
                      defaultValue="Lahra's Life"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">This appears in the browser tab and navigation</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Homepage Description
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Follow along as I share my daily adventures, style choices, dining discoveries, and all the little moments that make life beautiful."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Enable Comments</h4>
                      <p className="text-sm text-gray-600">Allow visitors to comment on your posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Enable Donations</h4>
                      <p className="text-sm text-gray-600">Show donation widget and support page</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Settings</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      🚀 Production Deployment
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Ready to go live? Your website is fully configured for production deployment with real payment processing.
                    </p>
                    <Button variant="outline" size="sm">
                      View Deployment Guide
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">
                      💳 Stripe Integration
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Donation system is ready for production. Connect your Stripe account to start receiving real donations.
                    </p>
                    <Button variant="outline" size="sm">
                      Configure Stripe
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">
                      🗄️ Database Migration
                    </h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Currently using mock data. Migrate to production database for persistent storage.
                    </p>
                    <Button variant="outline" size="sm">
                      Migration Guide
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Add custom CSS to further personalize your website's appearance.
                    </p>
                    <textarea
                      rows={6}
                      placeholder="/* Add your custom CSS here */"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="text-center mt-8">
            <Button size="lg" className="px-8">
              💾 Save Settings
            </Button>
          </div>
        </div>
      </ContentSection>
    </div>
  )
}