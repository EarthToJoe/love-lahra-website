'use client'

import { useState } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
  const { theme, availableThemes, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-50 shadow-lg"
      >
        🎨 Theme: {theme.name}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>
          <ModalTitle>Choose Your Vibe</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p className="text-neutral-600 mb-6">
            Select a theme that matches your current mood and style preferences.
          </p>
          
          <div className="space-y-4">
            {availableThemes.map((availableTheme) => (
              <div
                key={availableTheme.name}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  theme.name === availableTheme.name
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => {
                  setTheme(availableTheme)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-900">
                      {availableTheme.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {availableTheme.description}
                    </p>
                  </div>
                  
                  {/* Color Preview */}
                  <div className="flex space-x-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: availableTheme.colors.primary[500] }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: availableTheme.colors.accent[500] }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: availableTheme.colors.neutral[100] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-2">
              Easy Customization
            </h4>
            <p className="text-sm text-neutral-600">
              Themes can be easily modified or new ones created by updating the theme configuration. 
              Perfect for when your vibe changes or you want to match special occasions!
            </p>
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}